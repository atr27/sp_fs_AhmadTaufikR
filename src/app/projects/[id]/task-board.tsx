'use client';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { TaskStatus } from '@/generated/prisma';

interface User {
    id: string;
    name: string | null;
    email: string;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    assigneeId: string | null;
    assignee: User | null;
}

type Columns = Record<TaskStatus, Task[]>

interface TaskBoardProps {
    projectId: string;
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function TaskBoard({ projectId, tasks, setTasks }:
    TaskBoardProps) {

    const columns = Object.values(TaskStatus).reduce<Record<TaskStatus, Task[]>>((acc, status) => {
        acc[status] = tasks.filter(task => task.status === status);
        return acc;
    }, {} as Record<TaskStatus, Task[]>);
    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) {
            return;
        }
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }
        const draggedTask = tasks.find(task => task.id ===
            draggableId);
        if (!draggedTask) return;
        const newStatus = destination.droppableId as TaskStatus;
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === draggableId ? {
                    ...task, status:
                        newStatus
                } : task
            )
        );

        try {
            const response = await fetch(`/api/tasks/${draggableId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Failed to update task status');
            }
        } catch (error) {
            console.error('Error updating task status:', error);

            // Re-fetch or revert logic here. For now, we'll just log the error.
            // A more robust solution would be to refetch tasks from the server.
            console.error('Failed to update task, state might be inconsistent.');
            alert(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
    };
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-4">
                {Object.values(TaskStatus).map(status => (
                    <Droppable droppableId={status} key={status}>
                        {(provided: DroppableProvided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex-1 bg-gray-100 p-4 rounded-md shadow-inner min-h-[300px]"
                            >
                                <h3 className="text-lg font-semibold mb-4 capitalize">
                                    {status.split('_').map(word => word.toLowerCase()).join(' ')}
                                </h3>
                                {columns[status].map((task, index) => (
                                    <Draggable key={task.id}
                                        draggableId={task.id} index={index}>
                                        {(provided: DraggableProvided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="bg-white p-3 mb-3 rounded-md shadow-sm border border-gray-200"
                                            >
                                                <h4 className="font-medium">{task.title}</h4>
                                                {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
                                                {task.assignee && (
                                                    <p className="text-xs text-gray-500 mt-1">Assignee: {task.assignee?.name || task.assignee?.email}</p>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
}