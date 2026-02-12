import { Request, Response } from 'express';
import mongoose from 'mongoose';
import logger from '../utils/logger';

export const fetchAllUsers = async (req: Request, res: Response) => {
  try {
    // Get the native MongoDB database instance from mongoose
    const db = mongoose.connection.db;
    
    if (!db) {
      logger.error('Database connection not established', {
        particular: 'user_fetch_error'
      });
      return res.status(500).json({ 
        error: 'Database connection not established' 
      });
    }

    // Fetch all users from the users collection
    const users = await db.collection("users").find().toArray();

    logger.info(`Fetched ${users.length} users successfully`, {
      particular: 'user_fetch_success',
      count: users.length
    });

    // Return all users as response
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error fetching users', {
      particular: 'user_fetch_error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
