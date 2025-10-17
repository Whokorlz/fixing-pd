import Product from '../models/Product';
import Warehouse from '../models/Warehouse';
import { ModelStatic, QueryInterface } from 'sequelize';

const ProductModel = Product as ModelStatic<Product>;

export async function seedProducts(queryInterface?: QueryInterface): Promise<void> {
    try {
        const existingProducts = await ProductModel.count();
        if (existingProducts > 0) {
            console.log('03-Products Seeder: Products already exist. Skipping seeding.');
            return;
        }

        // 1. Obtener los IDs de las bodegas creadas
        const warehouses = await Warehouse.findAll({
            attributes: ['id', 'name'],
            raw: true,
        });

        if (warehouses.length === 0) {
            console.warn('03-Products Seeder: No warehouses found. Skipping product seeding.');
            return;
        }

        const medellinId = warehouses.find(w => w.name === 'Central Medellín')?.id;
        const bogotaId = warehouses.find(w => w.name === 'Regional Bogotá')?.id;

        if (!medellinId || !bogotaId) {
            console.error('03-Products Seeder: Could not find required warehouse IDs.');
            return;
        }

        // 2. Definir los productos
        const initialProducts = [
            {
                sku: 'LGT-001-MDL',
                name: 'Cajas de Cartón Estándar',
                description: 'Caja de 40x40x40 cm para envíos pequeños.',
                price: 5.50,
                warehouseId: medellinId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                sku: 'LGT-002-BOG',
                name: 'Pallet Industrial (1x1.2m)',
                description: 'Pallet de madera estándar para carga pesada.',
                price: 120.00,
                warehouseId: bogotaId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                sku: 'LGT-003-MDL',
                name: 'Etiquetas Autoadhesivas',
                description: 'Rollo de 500 etiquetas de envío.',
                price: 15.00,
                warehouseId: medellinId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        // 3. Insertar los productos
        await ProductModel.bulkCreate(initialProducts);
        console.log('03-Products Seeder: Successfully created initial products.');

    } catch (error) {
        console.error('03-Products Seeder Error:', error);
    }
}