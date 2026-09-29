import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingLevel, User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  create(email: string, passwordHash: string, name: string): Promise<User> {
    const user = this.usersRepository.create({
      email,
      password_hash: passwordHash,
      name,
    });
    return this.usersRepository.save(user);
  }

  async setTrainingLevel(
    id: string,
    trainingLevel: TrainingLevel,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.training_level = trainingLevel;
    return this.usersRepository.save(user);
  }
}
