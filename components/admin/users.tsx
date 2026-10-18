"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  PageHeading,
  Panel,
  SelectField,
  StatusBadge,
  ConfirmButton,
  EmptyState,
} from "@/components/shared";
import {
  SearchInput,
  ListPagination,
  PAGE_SIZE,
} from "@/components/dashboard/list-controls";
import { useDemo } from "@/hooks/use-demo";
import { useAction } from "@/hooks/use-action";
import { ROLE_LABELS } from "@/constants";
import { formatDate } from "@/lib/format";

export function UserManagement() {
  const { state, user, api } = useDemo();
  const { run } = useAction();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const records = state.users.filter(
    (u) =>
      (!role || u.role === role) &&
      (!status || u.active === (status === "Active")) &&
      `${u.name} ${u.email} ${state.employers.find((e) => e.userId === u.id)?.name ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(records.length / PAGE_SIZE)),
  );
  const target = state.users.find((u) => u.id === selected);
  const seeker = state.seekers.find((s) => s.id === selected);
  const company = state.employers.find((e) => e.userId === selected);
  return (
    <>
      <PageHeading
        eyebrow="Support the people behind the profiles"
        title="A community of possibilities."
        description="Search sample accounts, inspect permitted details, and manage demo account access."
      />
      <Panel
        title="Registered accounts"
        description="PESO administrator accounts are provisioned, never publicly self-registered."
      >
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end">
          <SearchInput
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search name, email, or company…"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Account role"
              placeholder="All roles"
              value={role}
              options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            />
            <SelectField
              label="Account access"
              placeholder="All account states"
              value={status}
              options={["Active", "Suspended"]}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        {records.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <p className="font-medium text-navy">{record.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {record.email}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {ROLE_LABELS[record.role]}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(record.createdAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={record.active ? "Active" : "Suspended"}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          aria-label={`View ${record.name}`}
                          onClick={() => setSelected(record.id)}
                        >
                          Details
                        </Button>
                        {record.id !== user?.id && (
                          <ConfirmButton
                            variant="ghost"
                            title={`${record.active ? "Suspend" : "Reactivate"} this sample account?`}
                            description={
                              record.active
                                ? "This account will no longer be able to use its demo workspace until a PESO administrator reactivates it."
                                : "This sample account will regain access to its role workspace."
                            }
                            onConfirm={() =>
                              run(
                                () =>
                                  api.setUserActive(record.id, !record.active),
                                `Sample account ${record.active ? "suspended" : "reactivated"}.`,
                              )
                            }
                          >
                            {record.active ? "Suspend" : "Reactivate"}
                          </ConfirmButton>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState
            title="No sample accounts match."
            description="Try another search, role, or account state."
          />
        )}
        <ListPagination
          total={records.length}
          page={currentPage}
          onChange={setPage}
        />
      </Panel>
      <Dialog
        open={!!target}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {target && (
            <>
              <DialogHeader>
                <DialogTitle>{target.name}</DialogTitle>
                <DialogDescription>
                  {ROLE_LABELS[target.role]} · Permitted sample account
                  information
                </DialogDescription>
              </DialogHeader>
              <StatusBadge status={target.active ? "Active" : "Suspended"} />
              <dl className="grid grid-cols-[100px_1fr] gap-4 text-xs">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all">{target.email}</dd>
                <dt className="text-muted-foreground">Registered</dt>
                <dd>{formatDate(target.createdAt)}</dd>
                {seeker && (
                  <>
                    <dt className="text-muted-foreground">Barangay</dt>
                    <dd>{seeker.barangay}</dd>
                    <dt className="text-muted-foreground">Education</dt>
                    <dd className="leading-6">
                      {seeker.education || "Not yet provided"}
                    </dd>
                    <dt className="text-muted-foreground">Skills</dt>
                    <dd className="leading-6">
                      {seeker.skills.join(", ") || "Not yet provided"}
                    </dd>
                  </>
                )}
                {company && (
                  <>
                    <dt className="text-muted-foreground">Company</dt>
                    <dd>{company.name}</dd>
                    <dt className="text-muted-foreground">Barangay</dt>
                    <dd>{company.barangay}</dd>
                    <dt className="text-muted-foreground">Accreditation</dt>
                    <dd>
                      <StatusBadge status={company.accreditationStatus} />
                    </dd>
                  </>
                )}
              </dl>
              <p className="rounded-lg bg-muted p-4 text-[11px] leading-6 text-muted-foreground">
                No passwords, authentication tokens, private document contents,
                or unnecessary personal records are available in this view.
                Production access must be enforced on the server.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
