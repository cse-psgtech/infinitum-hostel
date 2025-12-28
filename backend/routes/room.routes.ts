import { Router } from 'express';
import {
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    addMember,
    findRoomByMember,
    changeMemberRoom
} from '../controllers/room.controller';

const router = Router();

// Room routes
router.post('/', createRoom);           // Create a new room
router.post('/add-member', addMember);  // Add a member to a room
router.put('/change-room', changeMemberRoom); // Change a member's room
router.get('/', getAllRooms);           // Get all rooms
router.get('/:id', getRoomById);        // Get a single room by ID
router.get('/member/:identifier', findRoomByMember); // Find room by member email/uniqueId
router.put('/:id', updateRoom);         // Update a room
router.delete('/:id', deleteRoom);      // Delete a room

export default router;
