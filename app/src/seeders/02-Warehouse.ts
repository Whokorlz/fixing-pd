import Warehouse from '../models/Warehouse';
import { ModelStatic, QueryInterface } from 'sequelize';

const WarehouseModel = Warehouse as ModelStatic<Warehouse>;

const initialWarehouses = [
    {
        name: 'Central Medellín',
        address: 'Calle 10 # 50-10, Medellín',
        city: 'Medellín',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Regional Bogotá',
        address: 'Avenida El Dorado # 68C-61, Bogotá',
        city: 'Bogotá',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export async function seedWarehouses(queryInterface?: QueryInterface): Promise<void> {
    try {
        const existingWarehouses = await WarehouseModel.count();
        if (existingWarehouses > 0) {
            console.log('02-Warehouses Seeder: Warehouses already exist. Skipping seeding.');
            return;
        }

        await WarehouseModel.bulkCreate(initialWarehouses);
        console.log('02-Warehouses Seeder: Successfully created initial warehouses.');
        
    } catch (error) {
        console.error('02-Warehouses Seeder Error:', error);
    }
}