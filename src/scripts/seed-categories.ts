import { DataSource } from 'typeorm';
import { AppDataSource } from '../config/db.config';
import { Category } from '../categories/entities/category.entity';
import { CategoriesData } from './seed-categories.data';

export async function seedCategories(dataSource?: DataSource) {
  let externalDataSource = false;
  let ds: DataSource;

  if (dataSource) {
    ds = dataSource;
    externalDataSource = true;
  } else {
    ds = AppDataSource;
    if (!ds.isInitialized) {
      await ds.initialize();
    }
  }

  try {
    const categoryRepo = ds.getRepository(Category);

    if ((await categoryRepo.count()) > 0) {
      console.log('Таблица categories уже содержит данные, пропускаем сидинг.');
      return;
    }

    for (const parent of CategoriesData) {
      const category = await categoryRepo.save({ name: parent.name });

      if (!parent.children || parent.children.length === 0) {
        continue;
      }

      for (const child of parent.children) {
        await categoryRepo.save({
          name: child,
          parent: category,
        });
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (!externalDataSource && ds.isInitialized) {
      await ds.destroy();
    }
  }
}
