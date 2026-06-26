// app/actions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Crea un nuevo grupo (Banda) en la base de datos.
 */
export async function createGroup(name: string) {
    try {
        const group = await prisma.group.create({
            data: {
                name: name,
            },
        });
        return { success: true, group };
    } catch (error) {
        console.error('Error crítico al crear el grupo:', error);
        return { success: false, error: 'No se pudo inicializar el grupo.' };
    }
}

/**
 * Registra un nuevo integrante con su respectivo color dentro de un grupo.
 */
export async function createUser(name: string, color: string, groupId: string) {
    try {
        const user = await prisma.user.create({
            data: {
                name,
                color,
                groupId,
            },
        });

        // Forzamos a Next.js a limpiar la caché de este grupo específico para mostrar al nuevo usuario
        revalidatePath(`/${groupId}`);
        return { success: true, user };
    } catch (error) {
        console.error('Error crítico al crear el usuario:', error);
        return { success: false, error: 'No se pudo registrar el usuario.' };
    }
}

/**
 * Inserta un bloque de disponibilidad horaria asociado a un integrante.
 */
export async function addAvailability(
    userId: string,
    groupId: string,
    startTime: Date,
    endTime: Date
) {
    try {
        await prisma.availabilitySlot.create({
            data: {
                userId,
                startTime,
                endTime,
            },
        });

        // Revalidamos la ruta dinámica en el servidor para propagar los nuevos horarios pintados
        revalidatePath(`/${groupId}`);
        return { success: true };
    } catch (error) {
        console.error('Error crítico al agregar disponibilidad:', error);
        return { success: false, error: 'No se pudo almacenar la franja horaria.' };
    }
}

/**
 * Obtiene de forma relacional un grupo, sus integrantes y las horas de cada uno.
 */
export async function getGroupData(groupId: string) {
    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                users: {
                    include: {
                        availabilitySlots: true,
                    },
                },
            },
        });

        if (!group) {
            return { success: false, error: 'El grupo solicitado no existe.' };
        }

        return { success: true, group };
    } catch (error) {
        console.error('Error crítico al obtener los datos del grupo:', error);
        return { success: false, error: 'Error interno del servidor.' };
    }
}