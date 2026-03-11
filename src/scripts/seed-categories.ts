import {AppDataSource} from "../config/db.config";
import {Category} from "../categories/entities/category.entity";
import {CategoriesData} from "./seed-categories.data";

export async function seedCategories() {
    try {
        await AppDataSource.initialize();

        const categoryRepo = AppDataSource.getRepository(Category);

        if (await categoryRepo.count() > 0) {
            console.log('Таблица categories уже содержит данные, пропускаем сидинг.');
            await AppDataSource.destroy();
            return;
        }

        for (const parent of CategoriesData) {
            const category = await categoryRepo.save({name: parent.name});

            if (!parent.children || parent.children.length === 0) {
                continue;
            }

            for (const child of parent.children) {
                const childCategory = await categoryRepo.save({
                    name: child,
                    parent: category,
                });
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}
