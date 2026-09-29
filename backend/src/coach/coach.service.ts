import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FinishReason, GoogleGenAI } from '@google/genai';
import { TrainingLevel } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { WorkoutsService } from '../workouts/workouts.service';
import { SuggestWorkoutDto } from './dto/suggest-workout.dto';

export interface SuggestedWorkout {
  title: string;
  focus_area: string;
  exercises: Array<{ name: string; sets: number; reps: string; notes: string }>;
  rationale: string;
}

const LEVEL_GUIDANCE: Record<TrainingLevel, string> = {
  [TrainingLevel.BEGINNER]:
    'Beginner: pick 3-4 fundamental compound exercises, keep the plan simple, include a short form cue in the notes for each exercise, moderate volume (around 3 sets each).',
  [TrainingLevel.INTERMEDIATE]:
    'Intermediate: 4-6 exercises mixing compound and isolation work, moderate-to-higher volume, can introduce supersets occasionally.',
  [TrainingLevel.ADVANCED]:
    'Advanced: full autonomy on exercise selection and volume, feel free to use advanced techniques (supersets, rest-pause, drop sets) where they fit.',
};

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    focus_area: { type: 'string' },
    exercises: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          sets: { type: 'integer' },
          reps: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['name', 'sets', 'reps', 'notes'],
        additionalProperties: false,
      },
    },
    rationale: { type: 'string' },
  },
  required: ['title', 'focus_area', 'exercises', 'rationale'],
  additionalProperties: false,
} as const;

@Injectable()
export class CoachService {
  private readonly client: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly workoutsService: WorkoutsService,
  ) {
    this.client = new GoogleGenAI({
      apiKey: this.configService.getOrThrow<string>('GEMINI_API_KEY'),
    });
  }

  async suggestWorkout(
    userId: string,
    dto: SuggestWorkoutDto,
  ): Promise<SuggestedWorkout> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }
    const insights = await this.workoutsService.getInsights(userId);

    const levelGuidance =
      LEVEL_GUIDANCE[user.training_level ?? TrainingLevel.BEGINNER];

    const systemPrompt = [
      'You are a knowledgeable, encouraging gym coach suggesting a single workout for today.',
      levelGuidance,
      user.goal ? `The user's goal is to ${user.goal}.` : '',
      insights.imbalances.length > 0
        ? `Recent training gaps to consider: ${insights.imbalances.join('; ')}.`
        : '',
      insights.detected_split
        ? `The user's most recent session was detected as: ${insights.detected_split}.`
        : '',
      "If the user did not specify a focus for today, pick a focus that complements what they've trained recently rather than repeating it.",
      'Respond with a workout that fits in a normal gym session.',
    ]
      .filter(Boolean)
      .join(' ');

    const userMessage = dto.focus?.trim()
      ? `What I want to train today: ${dto.focus.trim()}`
      : "I don't have a specific focus today — suggest something.";

    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseJsonSchema: RESPONSE_SCHEMA,
      },
    });

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== FinishReason.STOP) {
      throw new InternalServerErrorException(
        'The coach could not generate a suggestion — please try again.',
      );
    }

    const text = response.text;
    if (!text) {
      throw new InternalServerErrorException(
        'The coach could not generate a suggestion — please try again.',
      );
    }

    return JSON.parse(text) as SuggestedWorkout;
  }
}
