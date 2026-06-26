// app/[groupId]/page.tsx

import { getGroupData } from '../actions';
import GroupClient from './GroupClient';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ groupId: string }>;
}

export default async function GroupPage({ params }: PageProps) {
    const { groupId } = await params;
    const res = await getGroupData(groupId);

    if (!res.success || !res.group) {
        return notFound();
    }

    // Mapeamos y aplanamos todas las disponibilidades de todos los usuarios
    // Convirtiendo las fechas nativas a strings ISO serializables
    const serializedEvents = res.group.users.flatMap((user) =>
        user.availabilitySlots.map((slot) => ({
            title: user.name,
            color: user.color,
            start: slot.startTime.toISOString(),
            end: slot.endTime.toISOString(),
        }))
    );

    const dbUsers = res.group.users.map((u) => ({
        id: u.id,
        name: u.name,
        color: u.color,
    }));

    return (
        <GroupClient
            groupId={res.group.id}
            groupName={res.group.name}
            dbUsers={dbUsers}
            serializedEvents={serializedEvents}
        />
    );
}