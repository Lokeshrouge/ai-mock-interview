import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { AnswersService } from './answers.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class InterviewsController {
  constructor(
    private readonly interviewsService: InterviewsService,
    private readonly answersService: AnswersService,
  ) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createInterviewDto: CreateInterviewDto) {
    return this.interviewsService.create(user.userId, createInterviewDto);
  }

  @Post(':id/start')
  start(@CurrentUser() user: any, @Param('id') id: string) {
    return this.interviewsService.startInterview(user.userId, id);
  }

  @Post(':id/answers')
  submitAnswer(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    return this.answersService.submitAnswer(user.userId, id, submitAnswerDto);
  }

  @Post(':id/complete')
  complete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.interviewsService.completeInterview(user.userId, id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.interviewsService.findOne(user.userId, id);
  }

  @Get(':id/report')
  getReport(@CurrentUser() user: any, @Param('id') id: string) {
    return this.interviewsService.getInterviewReport(user.userId, id);
  }

  @Get(':id/questions')
  getQuestions(@CurrentUser() user: any, @Param('id') id: string) {
    return this.interviewsService.getInterviewQuestions(user.userId, id);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.interviewsService.findAll(user.userId, page, limit, status);
  }
}
