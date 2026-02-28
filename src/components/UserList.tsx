import React, { useState } from 'react';
import { useUsers } from '../hooks';
import { UserSummary } from '../types';
import { UserStats } from './UserStats';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCell as ShadcnTableCell,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow,
} from './ui/table';

export const UserList: React.FC = () => {
  const { users, loading, error } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewStats = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleCloseStats = () => {
    setSelectedUserId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No users found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Registered Users</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View all registered users and their activity
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <ShadcnTable>
            <ShadcnTableHeader>
              <ShadcnTableRow>
                <ShadcnTableHead>Email</ShadcnTableHead>
                <ShadcnTableHead>Role</ShadcnTableHead>
                <ShadcnTableHead>Registration Date</ShadcnTableHead>
                <ShadcnTableHead className="text-right">Transaction Count</ShadcnTableHead>
                <ShadcnTableHead>Last Transaction</ShadcnTableHead>
                <ShadcnTableHead className="text-center">Actions</ShadcnTableHead>
              </ShadcnTableRow>
            </ShadcnTableHeader>
            <ShadcnTableBody>
              {users.map((user: UserSummary) => (
                <ShadcnTableRow key={user.id}>
                  <ShadcnTableCell className="font-medium">{user.email}</ShadcnTableCell>
                  <ShadcnTableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </ShadcnTableCell>
                  <ShadcnTableCell>{formatDate(user.createdAt)}</ShadcnTableCell>
                  <ShadcnTableCell className="text-right">{user.transactionCount}</ShadcnTableCell>
                  <ShadcnTableCell>{formatDate(user.lastTransactionDate)}</ShadcnTableCell>
                  <ShadcnTableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewStats(user.id)}
                      aria-label="View user statistics"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                      Stats
                    </Button>
                  </ShadcnTableCell>
                </ShadcnTableRow>
              ))}
            </ShadcnTableBody>
          </ShadcnTable>
        </CardContent>
      </Card>

      {selectedUserId && (
        <UserStats userId={selectedUserId} onClose={handleCloseStats} />
      )}
    </div>
  );
};
