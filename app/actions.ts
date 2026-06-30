// app/actions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Crea un nuevo grupo (Banda) en la base de datos y redirige automáticamente.
 */
export async function createGroup(name: string) {
    let newGroupId: string;

    // Genera un código alfanumérico aleatorio de 6 caracteres (ej: A9F3K1)
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
        const group = await prisma.group.create({
            data: { name, roomCode },
        });
        newGroupId = group.id;
    } catch (error) {
        console.error('Error crítico al crear el grupo:', error);
        return { success: false, error: 'No se pudo inicializar el grupo.' };
    }

    redirect(`/${newGroupId}`);
}
/**
 * Busca un grupo por su código de sala.
 */
export async function joinGroupByCode(code: string) {
    try {
        const group = await prisma.group.findUnique({
            where: { roomCode: code.toUpperCase() }
        });

        if (!group) {
            return { success: false, error: 'Código de sala inválido o no existe.' };
        }

        return { success: true, groupId: group.id };
    } catch (error) {
        return { success: false, error: 'Error al buscar la sala.' };
    }
}


/**
 * Registra un nuevo integrante con su respectivo color dentro de un grupo.
 * CORREGIDO: Validación de color duplicado antes de insertar.
 */
export async function createUser(name: string, color: string, groupId: string) {
    try {
        // 1. Verificamos si alguien más ya tomó este color en la banda
        const existingColor = await prisma.user.findFirst({
            where: {
                groupId: groupId,
                color: color,
            },
        });

        if (existingColor) {
            return { success: false, error: 'Este color ya fue elegido por otro integrante de la banda.' };
        }

        // 2. Si el color está libre, creamos el usuario
        const user = await prisma.user.create({
            data: {
                name,
                color,
                groupId,
            },
        });

        revalidatePath(`/${groupId}`);
        return { success: true, user };
    } catch (error) {
        console.error('Error crítico al crear el usuario:', error);
        return { success: false, error: 'No se pudo registrar el usuario.' };
    }
}

/**
 * Permite a un usuario cambiar su color si está disponible.
 */
export async function changeUserColor(userId: string, groupId: string, newColor: string) {
    try {
        const existingColor = await prisma.user.findFirst({
            where: { groupId, color: newColor },
        });

        if (existingColor) {
            return { success: false, error: 'Ese color acaba de ser tomado por otro integrante.' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { color: newColor }
        });

        revalidatePath(`/${groupId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Error interno al cambiar el color.' };
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
        const slot = await prisma.availabilitySlot.create({
            data: {
                userId,
                startTime,
                endTime,
            },
        });

        revalidatePath(`/${groupId}`);
        return { success: true, id: slot.id };
    } catch (error) {
        console.error('Error crítico al agregar disponibilidad:', error);
        return { success: false, error: 'No se pudo almacenar la franja horaria.' };
    }
}

/**
 * Elimina de forma permanente un bloque de disponibilidad.
 */
export async function deleteAvailability(slotId: string, groupId: string) {
    try {
        await prisma.availabilitySlot.delete({
            where: { id: slotId },
        });

        revalidatePath(`/${groupId}`);
        return { success: true };
    } catch (error) {
        console.error('Error crítico al eliminar disponibilidad:', error);
        return { success: false, error: 'No se pudo remover la franja horaria.' };
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