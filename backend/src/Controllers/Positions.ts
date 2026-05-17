import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPosition = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, companyId } = req.body;
        const position = await prisma.position.create({
            data: { title, companyId },
        });
        res.status(201).json(position);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllPositions = async (req: Request, res: Response): Promise<void> => {
    try {
        const positions = await prisma.position.findMany({
            select: {
                id: true,
                title: true,
                company: {
                    select: {
                        id: true,
                        name: true, 
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
            orderBy:{
                id:"asc"
            }
        });
        res.json(positions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


export const getPositionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const position = await prisma.position.findUnique({
            where: { id: parseInt(id) },
            include: { company: true },
        });
        if (!position) {
            res.status(404).json({ error: 'Position not found' });
            return;
        }
        res.json(position);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePosition = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, companyId } = req.body;
        const updatedPosition = await prisma.position.update({
            where: { id: parseInt(id) },
            data: { title, companyId },
        });
        res.json(updatedPosition);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deletePosition = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.position.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Position deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};