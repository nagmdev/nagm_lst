import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import prisma from "../config/prismaClient";

/**
 * Create a new Company (Admin Only)
 */
export const createCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, website, careerSiteUrl, status } = req.body;

    const company = await prisma.company.create({
      data: { name, website, careerSiteUrl, status },
    });

    res.status(201).json({ message: "Company created successfully!", company });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      res.status(409).json({ message: "A company with this name already exists." });
    } else {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

/**
 * Get all Companies (Public)
 */
export const getAllCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search = "" } = req.query;

    const companies = await prisma.company.findMany({
      where: { name: { contains: search as string, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get a Single Company by ID (Public)
 */
export const getCompanyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const company = await prisma.company.findUnique({
      where: { id }
    });

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update a Company (Admin Only)
 */
export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, website, careerSiteUrl, status } = req.body;

    const updatedCompany = await prisma.company.update({
      where: { id: Number(req.params.id) },
      data: { name, website, careerSiteUrl, status },
    });

    res.json({ message: "Company updated successfully!", company: updatedCompany });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Delete a Company (Admin Only)
 */
export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = Number(req.params.id);

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            leadershipPrinciples: true,
            positions: true,
            deepSeekInteractions: true,
          },
        },
      },
    });

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    // Check if company has related data
    const hasRelatedData = 
      company._count.leadershipPrinciples > 0 ||
      company._count.positions > 0 ||
      company._count.deepSeekInteractions > 0;

    if (hasRelatedData) {
      res.status(400).json({
        message: "Cannot delete company with related data",
        details: {
          leadershipPrinciples: company._count.leadershipPrinciples,
          positions: company._count.positions,
          deepSeekInteractions: company._count.deepSeekInteractions,
        },
        suggestion: "Please delete all related leadership principles, positions, and deep seek interactions first."
      });
      return;
    }

    // Delete company (now safe to delete)
    await prisma.company.delete({ where: { id: companyId } });
    res.json({ message: "Company deleted successfully!" });
  } catch (error: any) {
    console.error("Error deleting company:", error);
    
    if (error.code === 'P2003') {
      res.status(400).json({ 
        message: "Cannot delete company with related data",
        suggestion: "Please delete all related records first."
      });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

/**
 * Force Delete a Company with all related data (Admin Only)
 * This will delete the company and all its related records
 */
export const forceDeleteCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const companyId = Number(req.params.id);

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            leadershipPrinciples: true,
            positions: true,
            deepSeekInteractions: true,
          },
        },
      },
    });

    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    // Use transaction to delete all related data first, then the company
    await prisma.$transaction(async (tx: PrismaClient) => {
      // Delete deep seek interactions first (they reference both company and other models)
      await tx.deepSeekInteraction.deleteMany({
        where: { companyId },
      });

      // Delete leadership principles
      await tx.leadershipPrinciple.deleteMany({
        where: { companyId },
      });

      // Delete positions
      await tx.position.deleteMany({
        where: { companyId },
      });

      // Finally delete the company
      await tx.company.delete({
        where: { id: companyId },
      });
    });

    res.json({ 
      message: "Company and all related data deleted successfully!",
      deletedData: {
        leadershipPrinciples: company._count.leadershipPrinciples,
        positions: company._count.positions,
        deepSeekInteractions: company._count.deepSeekInteractions,
      }
    });
  } catch (error: any) {
    console.error("Error force deleting company:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
