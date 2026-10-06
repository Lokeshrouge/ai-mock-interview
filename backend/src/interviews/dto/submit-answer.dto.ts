import { IsUUID, IsString, MinLength, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  questionId: string;

  @IsString()
  @MinLength(50, { message: 'Answer must be at least 50 characters' })
  @MaxLength(5000, { message: 'Answer must not exceed 5000 characters' })
  answerText: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  timeTakenSeconds?: number;
}
