'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
interface UserSearchResult {
    id: string;
    email: string;
    name: string | null;
}
export default function InviteMemberForm({ projectId, onMemberAdded }: {
    projectId: string;
    onMemberAdded?: () => void;
}) {
    const [email, setEmail] = useState('');
    const [searchResults, setSearchResults] =
        useState<UserSearchResult[]>([]);
    const [selectedUser, setSelectedUser] =
        useState<UserSearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [debouncedEmail] = useDebounce(email, 500);
    const router = useRouter();
    useEffect(() => {
        const searchUsers = async () => {
            if (debouncedEmail.length < 3) {
                setSearchResults([]);
                return;
            }
            setSearchLoading(true);
            try {
                                const response = await fetch(`/api/users/search?query=${debouncedEmail}`);
                if (response.ok) {
                    const data: UserSearchResult[] = await response.json();
                    setSearchResults(data);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error('Error searching users:', error);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        };
        searchUsers();
    }, [debouncedEmail]);
    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) {
            alert('Please select a user to invite.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/members`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: selectedUser.id }),
            });
            if (response.ok) {
                alert(`${selectedUser.email} invited successfully!`);
                setEmail('');
                setSelectedUser(null);
                setSearchResults([]);
                if (onMemberAdded) {
                    onMemberAdded();
                } else {
                    router.refresh();
                }
            } else {
                const errorData = await response.json();
                alert(`Failed to invite user: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error inviting member:', error);
            alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-4 p-4 border rounded-md shadow-sm">
            <h2 className="text-xl font-semibold">Invite Members</h2>
            <form onSubmit={handleInvite}>
                <div>
                    <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700">User Email</label>
                    <input
                        type="email"
                        id="memberEmail"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setSelectedUser(null);
                        }}
                        placeholder="Search user by email"
                        disabled={loading}
                    />
                    {searchLoading && <p className="text-sm text-gray-500">Searching...</p>}
                    {searchResults.length > 0 && !selectedUser && (
                        <ul className="border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto bg-white">
                            {searchResults.map((user) => (
                                <li
                                    key={user.id}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                        setEmail(user.email);
                                        setSelectedUser(user);
                                        setSearchResults([]);
                                    }}
                                >
                                    {user.email} {user.name ? `(${user.name})` : ''}
                                </li>
                            ))}
                        </ul>
                    )}
                    {selectedUser && (
                        <p className="mt-2 text-sm text-green-600">Selected: {selectedUser.email} {selectedUser.name ? `(${selectedUser.name})` : ''}</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading || !selectedUser}
                >
                    {loading ? 'Inviting...' : 'Invite Member'}
                </button>
            </form>
        </div>
    );
}