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

    try {
        const group = await prisma.group.create({
            data: { name },
        });
        newGroupId = group.id;
    } catch (error) {
        console.error('Error crítico al crear el grupo:', error);
        return { success: false, error: 'No se pudo inicializar el grupo.' };
    }

    redirect(`/${newGroupId}`);
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

        revalidatePath(`/${groupId}`);
        return { success: true, user };
    } catch (error) {
        console.error('Error crítico al crear el usuario:', error);
        return { success: false, error: 'No se pudo registrar el usuario.' };
    }
}

/**
 * Inserta un bloque de disponibilidad horaria asociado a un integrante.
 * Corregido: Ahora retorna el ID del registro creado.
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