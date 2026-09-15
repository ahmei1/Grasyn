import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ProjectQueryDto } from '../projects/dto/project-query.dto';
import { TaskQueryDto } from '../tasks/dto/task-query.dto';
import { UpdateProjectDto } from '../projects/dto/update-project.dto';
import { UpdateTaskDto } from '../tasks/dto/update-task.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';

const pipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
});
describe('Request validation regressions', () => {
  it.each([ProjectQueryDto, TaskQueryDto])(
    'accepts filters together with pagination (%p)',
    async (metatype) => {
      const status = metatype === ProjectQueryDto ? 'ACTIVE' : 'TODO';
      await expect(
        pipe.transform(
          { status, page: '2', pageSize: '10' },
          { type: 'query', metatype },
        ),
      ).resolves.toMatchObject({ status, page: 2, pageSize: 10 });
      await expect(
        pipe.transform({ status: 'invented' }, { type: 'query', metatype }),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        pipe.transform({ pageSize: '1000' }, { type: 'query', metatype }),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );
  it.each([UpdateProjectDto, UpdateTaskDto])(
    'rejects null descriptions but permits clearing dates (%p)',
    async (metatype) => {
      await expect(
        pipe.transform({ description: null }, { type: 'body', metatype }),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        pipe.transform({ dueDate: null }, { type: 'body', metatype }),
      ).resolves.toMatchObject({ dueDate: null });
    },
  );
  it('rejects whitespace-only names', async () => {
    await expect(
      pipe.transform(
        { email: 'a@example.com', password: 'password123', name: '   ' },
        { type: 'body', metatype: RegisterDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('validates timezones', async () => {
    await expect(
      pipe.transform(
        { timezone: 'not-a-zone' },
        { type: 'body', metatype: UpdateProfileDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      pipe.transform(
        { timezone: 'Africa/Kigali' },
        { type: 'body', metatype: UpdateProfileDto },
      ),
    ).resolves.toMatchObject({ timezone: 'Africa/Kigali' });
  });
});
