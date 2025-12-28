import { Request, Response } from 'express';
import crypto from 'crypto';

// In-memory store for desk sessions (use Redis in production)
interface DeskSession {
  deskId: string;
  signature: string;
  createdAt: number;
  expiresAt: number;
}

const deskSessions = new Map<string, DeskSession>();

// Session expiry time (30 minutes)
const SESSION_EXPIRY = 30 * 60 * 1000;

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [deskId, session] of deskSessions.entries()) {
    if (session.expiresAt < now) {
      deskSessions.delete(deskId);
    }
  }
}, 60000); // Clean every minute

// Create a new desk session
export const createDeskSession = async (req: Request, res: Response) => {
  try {
    // Generate unique desk ID
    const deskId = crypto.randomBytes(16).toString('hex');
    
    // Generate signature for validation
    const signature = crypto.randomBytes(32).toString('hex');
    
    const now = Date.now();
    const session: DeskSession = {
      deskId,
      signature,
      createdAt: now,
      expiresAt: now + SESSION_EXPIRY
    };
    
    // Store session
    deskSessions.set(deskId, session);
    
    res.status(200).json({
      success: true,
      data: {
        deskId,
        signature,
        expiresIn: SESSION_EXPIRY
      }
    });
  } catch (error: any) {
    console.error('Error creating desk session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating desk session',
      error: error.message
    });
  }
};

// Validate desk session
export const validateDeskSession = (deskId: string, signature: string): boolean => {
  const session = deskSessions.get(deskId);
  
  if (!session) {
    return false;
  }
  
  // Check if session expired
  if (session.expiresAt < Date.now()) {
    deskSessions.delete(deskId);
    return false;
  }
  
  // Validate signature
  return session.signature === signature;
};

// Refresh desk session (extend expiry)
export const refreshDeskSession = async (req: Request, res: Response) => {
  try {
    const { deskId, signature } = req.body;
    
    if (!validateDeskSession(deskId, signature)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired desk session'
      });
    }
    
    const session = deskSessions.get(deskId);
    if (session) {
      session.expiresAt = Date.now() + SESSION_EXPIRY;
      deskSessions.set(deskId, session);
    }
    
    res.status(200).json({
      success: true,
      message: 'Session refreshed',
      data: {
        expiresIn: SESSION_EXPIRY
      }
    });
  } catch (error: any) {
    console.error('Error refreshing desk session:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing desk session',
      error: error.message
    });
  }
};
