import { AppDataSource } from '../config/db.config';
import { City } from '../cities/entities/city.entity';
import { russianCities } from './seed-cities.data';

export async function seedCities() {
  try {
    await AppDataSource.initialize();

    const cityRepo = AppDataSource.getRepository(City);

    if ((await cityRepo.count()) > 0) {
      console.log('Таблица cities уже содержит данные, пропускаем сидинг.');
      await AppDataSource.destroy();
      return;
    }

    for (const cityName of russianCities) {
      await cityRepo.save({ name: cityName });
    }

    console.log(`Добавлено ${russianCities.length} городов.`);
  } catch (err) {
    console.error(err);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}
