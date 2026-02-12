import { Request, Response } from 'express';
import { z } from 'zod';
import { Accommodation } from '../models/Accommodation';
import logger from '../utils/logger';

// Zod schema for accommodation registration
const registerAccommodationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  uniqueId: z.string().min(1, 'Unique ID is required'),
  college: z.string().min(1, 'College is required'),
  residentialAddress: z.string().min(1, 'Residential address is required'),
  city: z.string().min(1, 'City is required'),
  phone: z.string().min(1, 'Phone number is required'),
  gender: z.enum(['male', 'female', 'other'], 'Invalid gender'),
  day: z.enum(['12', '13', '14', '12 & 13', '13 & 14', '12, 13 & 14'], 'Invalid day selection').optional(),
  remarks: z.string().optional(),
  optin: z.boolean().optional(),
  allocated: z.boolean().optional(),
});

export const registerAccommodation = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerAccommodationSchema.parse(req.body);

    logger.info('Attempting to register accommodation', {
      uniqueId: validatedData.uniqueId,
      email: validatedData.email,
      particular: 'register_accommodation'
    });

    // Check if accommodation with same uniqueId already exists
    const existingAccommodation = await Accommodation.findOne({ uniqueId: validatedData.uniqueId });
    if (existingAccommodation) {
      logger.warn('Accommodation registration failed - duplicate uniqueId', {
        uniqueId: validatedData.uniqueId,
        email: validatedData.email,
        particular: 'register_accommodation_duplicate'
      });
      return res.status(409).json({
        success: false,
        message: 'Accommodation with this unique ID already exists'
      });
    }

    // Create new accommodation
    const newAccommodation = new Accommodation({
      ...validatedData,
      vacated: false, // Default to not vacated
    });

    await newAccommodation.save();

    logger.info('Accommodation registered successfully', {
      uniqueId: validatedData.uniqueId,
      email: validatedData.email,
      particular: 'register_accommodation_success',
      accommodationId: newAccommodation._id
    });

    res.status(201).json({
      success: true,
      message: 'Accommodation registered successfully',
      data: newAccommodation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Accommodation registration validation error', {
        particular: 'register_accommodation_validation_error',
        errors: error.issues
      });
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues
      });
    }

    logger.error('Error registering accommodation', {
      particular: 'register_accommodation_error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAccommodationByUniqueId = async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.params;

    if (!uniqueId) {
      logger.warn('Get accommodation by uniqueId failed - missing uniqueId', {
        particular: 'get_accommodation_uniqueid_missing'
      });
      return res.status(400).json({
        success: false,
        message: 'Unique ID is required'
      });
    }

    logger.info('Fetching accommodation by uniqueId', {
      uniqueId,
      particular: 'get_accommodation_uniqueid'
    });

    // Find accommodation
    const accommodation = await Accommodation.findOne({ uniqueId });
    if (!accommodation) {
      logger.warn('Accommodation not found by uniqueId', {
        uniqueId,
        particular: 'get_accommodation_uniqueid_not_found'
      });
      return res.status(404).json({
        success: false,
        message: 'Accommodation not found'
      });
    }

    logger.info('Accommodation fetched successfully by uniqueId', {
      uniqueId,
      email: accommodation.email,
      particular: 'get_accommodation_uniqueid_success'
    });

    res.status(200).json({
      success: true,
      data: {
        accommodation
      }
    });
  } catch (error) {
    logger.error('Error fetching accommodation by uniqueId', {
      uniqueId: req.params.uniqueId,
      particular: 'get_accommodation_uniqueid_error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAccommodationByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      logger.warn('Get accommodation by email failed - missing email', {
        particular: 'get_accommodation_email_missing'
      });
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    logger.info('Fetching accommodation by email', {
      email,
      particular: 'get_accommodation_email'
    });

    // Find accommodation
    const accommodation = await Accommodation.findOne({ email });
    if (!accommodation) {
      logger.warn('Accommodation not found by email', {
        email,
        particular: 'get_accommodation_email_not_found'
      });
      return res.status(404).json({
        success: false,
        message: 'Accommodation not found'
      });
    }

    logger.info('Accommodation fetched successfully by email', {
      uniqueId: accommodation.uniqueId,
      email,
      particular: 'get_accommodation_email_success'
    });

    res.status(200).json({
      success: true,
      data: {
        accommodation
      }
    });
  } catch (error) {
    logger.error('Error fetching accommodation by email', {
      email: req.params.email,
      particular: 'get_accommodation_email_error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get accommodation statistics
export const getAccommodationStats = async (req: Request, res: Response) => {
  try {
    logger.info('Fetching accommodation statistics', {
      particular: 'get_accommodation_stats'
    });

    // Total counts
    const totalAccommodations = await Accommodation.countDocuments();
    const totalAllocated = await Accommodation.countDocuments({ allocated: true });
    const totalNotAllocated = await Accommodation.countDocuments({ allocated: false });
    const totalVacated = await Accommodation.countDocuments({ vacated: true });
    const totalOccupied = await Accommodation.countDocuments({ vacated: false });

    // Gender statistics (overall)
    const maleStats = await Accommodation.countDocuments({ gender: 'male' });
    const femaleStats = await Accommodation.countDocuments({ gender: 'female' });
    const otherStats = await Accommodation.countDocuments({ gender: 'other' });

    // Allocated and occupied (vacated: false) statistics by day
    const days = ['12', '13', '14', '12 & 13', '13 & 14', '12, 13 & 14'];
    const dayStats = await Promise.all(
      days.map(async (day) => {
        const total = await Accommodation.countDocuments({ day, allocated: true, vacated: false });
        const male = await Accommodation.countDocuments({ day, gender: 'male', allocated: true, vacated: false });
        const female = await Accommodation.countDocuments({ day, gender: 'female', allocated: true, vacated: false });
        const vacated = await Accommodation.countDocuments({ day, allocated: true, vacated: true });
        const remaining = await Accommodation.countDocuments({ day, allocated: true, vacated: false });
        const totalAllocated = await Accommodation.countDocuments({ day, allocated: true });
        return { day, total, male, female, vacated, remaining, totalAllocated };
      })
    );

    // Gender breakdown for allocated and occupied
    const allocatedOccupiedMale = await Accommodation.countDocuments({ gender: 'male', allocated: true, vacated: false });
    const allocatedOccupiedFemale = await Accommodation.countDocuments({ gender: 'female', allocated: true, vacated: false });

    // Vacated statistics for allocated people
    const totalAllocatedVacated = await Accommodation.countDocuments({ allocated: true, vacated: true });
    const totalAllocatedRemaining = await Accommodation.countDocuments({ allocated: true, vacated: false });

    // Status breakdown
    const allocatedOccupied = await Accommodation.countDocuments({ allocated: true, vacated: false });
    const allocatedVacated = await Accommodation.countDocuments({ allocated: true, vacated: true });
    const notAllocatedOccupied = await Accommodation.countDocuments({ allocated: false, vacated: false });
    const notAllocatedVacated = await Accommodation.countDocuments({ allocated: false, vacated: true });

    logger.info('Accommodation statistics fetched successfully', {
      particular: 'get_accommodation_stats_success',
      totalAccommodations,
      totalAllocated
    });

    res.status(200).json({
      success: true,
      data: {
        totalAccommodations,
        totalAllocated,
        totalNotAllocated,
        totalVacated,
        totalOccupied,
        genderStats: {
          male: maleStats,
          female: femaleStats,
          other: otherStats
        },
        dayStats,
        allocatedOccupiedByGender: {
          male: allocatedOccupiedMale,
          female: allocatedOccupiedFemale,
          total: allocatedOccupied
        },
        vacatedStats: {
          totalAllocatedVacated,
          totalAllocatedRemaining
        },
        statusBreakdown: {
          allocatedOccupied,
          allocatedVacated,
          notAllocatedOccupied,
          notAllocatedVacated
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching accommodation stats', {
      particular: 'get_accommodation_stats_error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all accommodations
export const getAllAccommodations = async (req: Request, res: Response) => {
  try {
    logger.info('Fetching all accommodations', {
      particular: 'get_all_accommodations'
    });

    // Fetch all accommodations
    const accommodations = await Accommodation.find();

    logger.info('All accommodations fetched successfully', {
      particular: 'get_all_accommodations_success',
      count: accommodations.length
    });

    res.status(200).json({
      success: true,
      count: accommodations.length,
      data: accommodations
    });
  } catch (error) {
    logger.error('Error fetching all accommodations', {
      particular: 'get_all_accommodations_error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Zod schema for updating accommodation
const updateAccommodationSchema = z.object({
  remarks: z.string().optional(),
  day: z.enum(['12', '13', '14', '12 & 13', '13 & 14', '12, 13 & 14']).optional(),
  optin: z.boolean().optional(),
  allocated: z.boolean().optional(),
  vacated: z.boolean().optional(),
});

// Update accommodation details
export const updateAccommodation = async (req: Request, res: Response) => {
  try {
    const { uniqueId } = req.params;

    if (!uniqueId) {
      logger.warn('Update accommodation failed - missing uniqueId', {
        particular: 'update_accommodation_missing_uniqueid'
      });
      return res.status(400).json({
        success: false,
        message: 'Unique ID is required'
      });
    }

    // Validate request body
    const validatedData = updateAccommodationSchema.parse(req.body);

    logger.info('Attempting to update accommodation', {
      uniqueId,
      particular: 'update_accommodation',
      updates: Object.keys(validatedData)
    });

    // Find and update accommodation
    const accommodation = await Accommodation.findOne({ uniqueId });

    if (!accommodation) {
      logger.warn('Update accommodation failed - not found', {
        uniqueId,
        particular: 'update_accommodation_not_found'
      });
      return res.status(404).json({
        success: false,
        message: 'Accommodation not found'
      });
    }

    // Update fields if provided
    if (validatedData.remarks !== undefined) {
      accommodation.remarks = validatedData.remarks;
    }
    if (validatedData.day !== undefined) {
      accommodation.day = validatedData.day;
    }
    if (validatedData.optin !== undefined) {
      accommodation.optin = validatedData.optin;
    }
    if (validatedData.allocated !== undefined) {
      accommodation.allocated = validatedData.allocated;
    }
    if (validatedData.vacated !== undefined) {
      accommodation.vacated = validatedData.vacated;
    }

    await accommodation.save();

    logger.info('Accommodation updated successfully', {
      uniqueId,
      particular: 'update_accommodation_success',
      accommodationId: accommodation._id
    });

    res.status(200).json({
      success: true,
      message: 'Accommodation updated successfully',
      data: accommodation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Update accommodation validation error', {
        particular: 'update_accommodation_validation_error',
        errors: error.issues
      });
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues
      });
    }

    logger.error('Error updating accommodation', {
      particular: 'update_accommodation_error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
