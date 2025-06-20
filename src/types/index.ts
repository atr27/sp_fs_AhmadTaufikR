export interface Project {
    id: string;
    title: string;
    description: string | null;
    ownerId: string;
    owner: { name: string | null; email: string };
}
