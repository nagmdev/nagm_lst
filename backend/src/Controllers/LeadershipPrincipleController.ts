import { Request, Response } from "express";
import prisma from "../config/prismaClient";


export const createLeadershipPrinciple = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, companyId } = req.body;

    if (!name || !description || !companyId) {
      res.status(400).json({ message: "name, description, and companyId are required" });
      return;
    }

    const leadershipPrinciple = await prisma.leadershipPrinciple.create({
      data: {
        name,
        description,
        company: { connect: { id: companyId } },
      },
    });

    res.status(201).json({ message: "Leadership Principle created successfully!", leadershipPrinciple });
  } catch (error: any) {
    console.error("Error creating Leadership Principle:", error);

    if (error.code === 'P2002') { // Prisma unique constraint failed
      res.status(409).json({ message: "Leadership Principle with this name already exists for this company." });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

/**
 * Get all Leadership Principles (Public)
 */
export const getAllLeadershipPrinciples = async (req: Request, res: Response): Promise<void> => {
  try {
    const principles = await prisma.leadershipPrinciple.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(200).json({ data: principles });
  } catch (error) {
    console.error("Error fetching Leadership Principles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a single Leadership Principle by ID (Public)
 */
export const getLeadershipPrincipleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }

    const principle = await prisma.leadershipPrinciple.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    if (!principle) {
      res.status(404).json({ message: "Leadership Principle not found" });
      return;
    }

    res.status(200).json(principle);
  } catch (error) {
    console.error("Error fetching Leadership Principle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a Leadership Principle (Admin Only)
 */
export const updateLeadershipPrinciple = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, description, companyId } = req.body;

    if (!id || isNaN(id)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }

    if (!name || !description || !companyId) {
      res.status(400).json({ message: "name, description, and companyId are required" });
      return;
    }

    const updatedPrinciple = await prisma.leadershipPrinciple.update({
      where: { id },
      data: {
        name,
        description,
        company: { connect: { id: companyId } },
      },
    });

    res.status(200).json({ message: "Leadership Principle updated successfully!", principle: updatedPrinciple });
  } catch (error: any) {
    console.error("Error updating Leadership Principle:", error);

    if (error.code === 'P2002') {
      res.status(409).json({ message: "Leadership Principle with this name already exists for this company." });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

/**
 * Delete a Leadership Principle (Admin Only)
 */
export const deleteLeadershipPrinciple = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }

    await prisma.leadershipPrinciple.delete({
      where: { id },
    });

    res.status(200).json({ message: "Leadership Principle deleted successfully!" });
  } catch (error) {
    console.error("Error deleting Leadership Principle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
