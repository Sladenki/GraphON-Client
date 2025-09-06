'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { GraphInfo } from '@/types/graph.interface';
import { useAuth } from '@/providers/AuthProvider';

export default function ManagePage() {
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const anyUser: any = user as any;
    const managedIds: string[] = Array.isArray(anyUser?.managed_graph_id) ? anyUser.managed_graph_id : (Array.isArray(anyUser?.managedGraphIds) ? anyUser.managedGraphIds : []);
    const graphId = searchParams.get('id') || managedIds[0];

    const { data, isLoading, isError, refetch } = useQuery<GraphInfo>({
        queryKey: ['manageGraph', graphId],
        queryFn: () => GraphService.getGraphById(graphId),
        staleTime: 60_000,
    });

    if (!graphId) return <div style={{ padding: 16 }}>Не найден доступный граф для управления</div>;
    if (isLoading) return <SpinnerLoader/>;
    if (isError || !data) return (
        <div style={{ padding: 16 }}>
            <p>Ошибка загрузки данных графа</p>
            <button onClick={() => refetch()}>Повторить</button>
        </div>
    );

    return (
        <div style={{ padding: 16 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Управление графом</h1>
            <div style={{
                border: '1px solid rgba(150,130,238,0.25)',
                borderRadius: 12,
                padding: 16,
                background: 'var(--block-color)'
            }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Название</div>
                <div style={{ marginBottom: 16 }}>{data.name}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Подписки</div>
                <div>{data.subsNum}</div>
            </div>
        </div>
    );
}


