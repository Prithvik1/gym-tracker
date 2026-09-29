import { MuscleGroup } from '../exercises/exercise.entity';
import { computeImbalances, detectSplitLabel } from './workouts.service';

describe('detectSplitLabel', () => {
  it('labels a push-dominant day as Push', () => {
    expect(
      detectSplitLabel([
        MuscleGroup.CHEST,
        MuscleGroup.SHOULDERS,
        MuscleGroup.TRICEPS,
      ]),
    ).toBe('Push');
  });

  it('labels a pull-dominant day as Pull', () => {
    expect(detectSplitLabel([MuscleGroup.BACK, MuscleGroup.BICEPS])).toBe(
      'Pull',
    );
  });

  it('labels a legs-dominant day as Legs', () => {
    expect(
      detectSplitLabel([
        MuscleGroup.QUADS,
        MuscleGroup.HAMSTRINGS,
        MuscleGroup.GLUTES,
      ]),
    ).toBe('Legs');
  });

  it('labels a single trained group as "<Group> Day"', () => {
    expect(detectSplitLabel([MuscleGroup.CORE])).toBe('Core Day');
  });

  it('labels a day with no clear dominant category as Full Body', () => {
    expect(detectSplitLabel([MuscleGroup.CHEST, MuscleGroup.BACK])).toBe(
      'Full Body',
    );
  });

  it('labels an empty day as Rest', () => {
    expect(detectSplitLabel([])).toBe('Rest');
  });
});

describe('computeImbalances', () => {
  const now = new Date('2026-07-27T00:00:00Z');

  it('flags a major group never trained', () => {
    const messages = computeImbalances({}, now);
    expect(messages).toContain("You haven't trained chest yet");
  });

  it('flags a major group not trained within the threshold window', () => {
    const messages = computeImbalances(
      { [MuscleGroup.BACK]: new Date('2026-07-01T00:00:00Z') },
      now,
      14,
    );
    expect(messages.some((m) => m.startsWith("You haven't trained back"))).toBe(
      true,
    );
  });

  it('does not flag a major group trained within the threshold window', () => {
    const messages = computeImbalances(
      { [MuscleGroup.BACK]: new Date('2026-07-25T00:00:00Z') },
      now,
      14,
    );
    expect(messages.some((m) => m.includes('back'))).toBe(false);
  });

  it('never flags minor groups like calves or core', () => {
    const messages = computeImbalances({}, now);
    expect(messages.some((m) => m.includes('calves'))).toBe(false);
    expect(messages.some((m) => m.includes('core'))).toBe(false);
  });
});
