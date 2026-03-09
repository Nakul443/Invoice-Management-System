// logic for registration and login of users

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default';

// 1. Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });
    
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(400).json({ error: "User already exists or data invalid" });
  }
};

// 2. Login and get a token
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token: token, userName: user.name });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};