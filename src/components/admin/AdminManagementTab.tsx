import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  Ban,
  RotateCcw,
  Trash2,
  KeyRound,
  X,
} from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';
import { useAuth, AdminUserProfile, AdminRole } from '../../context/AuthContext';

interface InvitationRow {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  invitedBy: string;
  createdAt: string;
  expiresAt: number;
  acceptedAt: string | null;
  revokedAt: string | null;
}

interface AdminManagementTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type StepUpAction =
  | { kind: 'role'; admin: AdminUserProfile; newRole: 'admin' | 'editor' }
  | { kind: 'revoke'; admin: AdminUserProfile }
  | { kind: 'restore'; admin: AdminUserProfile }
  | { kind: 'reset2fa'; admin: AdminUserProfile };

export const AdminManagementTab: React.FC<AdminManagementTabProps> = ({ showToast }) => {
  const { user, role } = useAuth();
  const [admins, setAdmins] = useState<AdminUserProfile[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor'>('editor');
  const [inviteOtp, setInviteOtp] = useState('');
  const [inviting, setInviting] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Step-up modal state
  const [stepUpAction, setStepUpAction] = useState<StepUpAction | null>(null);
  const [stepUpOtp, setStepUpOtp] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const isPrivileged = role === 'super_admin' || role === 'admin';
  const isSuperAdmin = role === 'super_admin';

  const loadAdmins = useCallback(async () => {
    if (!isPrivileged) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<{ admins: AdminUserProfile[]; invitations: InvitationRow[] }>('/api/admins');
      setAdmins(res.admins || []);
      setInvitations(res.invitations || []);
    } catch (err: any) {
      showToast(err?.message || 'Could not load administrator accounts', 'error');
    } finally {
      setLoading(false);
    }
  }, [isPrivileged, showToast]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(inviteOtp)) {
      showToast('Enter a 6-digit authenticator code to create an invitation.', 'error');
      return;
    }
    setInviting(true);
    try {
      const res = await apiFetch<{ invitePath: string }>('/api/admins/invite', {
        method: 'POST',
        body: {
          email: inviteEmail.trim(),
          name: inviteName.trim(),
          role: inviteRole,
          totpCode: inviteOtp,
        },
      });
      const fullUrl = `${window.location.origin}${res.invitePath}`;
      setGeneratedInviteUrl(fullUrl);
      setInviteEmail('');
      setInviteName('');
      setInviteOtp('');
      showToast('Secure invitation link created');
      await loadAdmins();
    } catch (err: any) {
      showToast(err?.message || 'Failed to invite administrator', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    try {
      await apiFetch(`/api/admins/invite/${id}`, { method: 'DELETE' });
      showToast('Invitation cancelled');
      await loadAdmins();
    } catch (err: any) {
      showToast(err?.message || 'Could not cancel invitation', 'error');
    }
  };

  const executeStepUpAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepUpAction || !/^\d{6}$/.test(stepUpOtp)) {
      showToast('Enter a valid 6-digit Google Authenticator code.', 'error');
      return;
    }
    setProcessingAction(true);
    try {
      if (stepUpAction.kind === 'role') {
        await apiFetch(`/api/admins/${stepUpAction.admin.id}/role`, {
          method: 'PATCH',
          body: { role: stepUpAction.newRole, totpCode: stepUpOtp },
        });
        showToast(`Updated ${stepUpAction.admin.email} to ${stepUpAction.newRole}`);
      } else if (stepUpAction.kind === 'revoke') {
        await apiFetch(`/api/admins/${stepUpAction.admin.id}/revoke`, {
          method: 'POST',
          body: { totpCode: stepUpOtp },
        });
        showToast(`Revoked access for ${stepUpAction.admin.email}`);
      } else if (stepUpAction.kind === 'restore') {
        await apiFetch(`/api/admins/${stepUpAction.admin.id}/restore`, {
          method: 'POST',
          body: { totpCode: stepUpOtp },
        });
        showToast(`Restored access for ${stepUpAction.admin.email}`);
      } else if (stepUpAction.kind === 'reset2fa') {
        await apiFetch(`/api/admins/${stepUpAction.admin.id}/reset-2fa`, {
          method: 'POST',
          body: { totpCode: stepUpOtp },
        });
        showToast(`2FA reset for ${stepUpAction.admin.email}. They will re-enroll at next sign-in.`);
      }
      setStepUpAction(null);
      setStepUpOtp('');
      await loadAdmins();
    } catch (err: any) {
      showToast(err?.message || 'Step-up verification rejected', 'error');
    } finally {
      setProcessingAction(false);
    }
  };

  if (!isPrivileged) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
        <ShieldAlert size={28} className="mx-auto text-amber-400" />
        <h3 className="text-base font-semibold text-white">Restricted Privilege Zone</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Only <span className="text-white font-mono">Admin</span> or <span className="text-white font-mono">Super Admin</span> accounts can invite collaborators or alter role privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-amber-400" />
            <span>Administrator Accounts &amp; RBAC Governance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-based access control (Super Admin, Admin, Editor) with mandatory 2FA step-up approval.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAdmins}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 cursor-pointer self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Accounts</span>
        </button>
      </div>

      {/* Invite New Collaborator */}
      <form onSubmit={handleInvite} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <UserPlus size={16} className="text-amber-400" />
          <span>Invite New Administrator / Editor</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Email Address *</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="collaborator@domain.com"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Full Name *</label>
            <input
              type="text"
              required
              minLength={2}
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Collaborator Name"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Assigned Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'editor')}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
            >
              <option value="editor">Editor (CMS Content Only)</option>
              {isSuperAdmin && <option value="admin">Admin (CMS + Security + Invites)</option>}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Your 6-Digit OTP *</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="000000"
              value={inviteOtp}
              onChange={(e) => setInviteOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono tracking-[0.25em] text-center"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={inviting}
          className="px-5 py-2.5 rounded-xl font-semibold bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          {inviting ? 'Generating Secure Token...' : 'Generate Invitation Link'}
        </button>

        {generatedInviteUrl && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="text-emerald-300 font-semibold">
              One-Time Invitation Link Ready (expires in 48 hours):
            </div>
            <div className="flex items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <code className="font-mono text-[11px] text-amber-200 break-all select-all">
                {generatedInviteUrl}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedInviteUrl);
                  setCopiedInvite(true);
                  setTimeout(() => setCopiedInvite(false), 2000);
                }}
                className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 shrink-0 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedInvite ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedInvite ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Active & Revoked Admins Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white">Authorized Accounts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Administrator</th>
                <th className="p-3">Role</th>
                <th className="p-3">2FA Status</th>
                <th className="p-3">Account Status</th>
                <th className="p-3">Last Login</th>
                <th className="p-3 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {admins.map((adm) => {
                const isSelf = adm.id === user?.id;
                return (
                  <tr key={adm.id} className="hover:bg-slate-950/40">
                    <td className="p-3">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{adm.name}</span>
                        {adm.isPrimaryOwner && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                            Primary Owner
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-[10px] text-slate-400 font-mono">(You)</span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{adm.email}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 font-mono text-[10px] uppercase">
                        {adm.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[11px] font-mono ${
                          adm.totpEnabled ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {adm.totpEnabled ? 'TOTP Enforced' : 'Setup Required'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                          adm.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {adm.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {adm.lastLoginAt ? new Date(adm.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      {!adm.isPrimaryOwner && isSuperAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setStepUpOtp('');
                              setStepUpAction({
                                kind: 'role',
                                admin: adm,
                                newRole: adm.role === 'admin' ? 'editor' : 'admin',
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] cursor-pointer"
                          >
                            Switch to {adm.role === 'admin' ? 'Editor' : 'Admin'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setStepUpOtp('');
                              setStepUpAction({ kind: 'reset2fa', admin: adm });
                            }}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 cursor-pointer"
                            title="Force 2FA Reset"
                          >
                            <KeyRound size={13} />
                          </button>
                        </>
                      )}

                      {!adm.isPrimaryOwner && !isSelf && (
                        adm.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setStepUpOtp('');
                              setStepUpAction({ kind: 'revoke', admin: adm });
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 cursor-pointer"
                            title="Revoke Access"
                          >
                            <Ban size={13} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setStepUpOtp('');
                              setStepUpAction({ kind: 'restore', admin: adm });
                            }}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 cursor-pointer"
                            title="Restore Access"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white">Pending &amp; Historical Invitations</h3>
          <div className="divide-y divide-slate-800 text-xs">
            {invitations.map((inv) => {
              const status = inv.acceptedAt
                ? 'Accepted'
                : inv.revokedAt
                ? 'Revoked'
                : inv.expiresAt < Date.now()
                ? 'Expired'
                : 'Pending';
              return (
                <div key={inv.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-white">
                      {inv.name} <span className="font-mono text-slate-400">&lt;{inv.email}&gt;</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Role: {inv.role} &bull; Invited by {inv.invitedBy} &bull; Status: {status}
                    </div>
                  </div>
                  {status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => handleRevokeInvitation(inv.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Cancel Invite</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step-Up OTP Modal */}
      {stepUpAction && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setStepUpAction(null);
          }}
        >
          <form
            onSubmit={executeStepUpAction}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 text-xs shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Shield size={16} className="text-amber-400" />
                <span>Step-Up 2FA Confirmation</span>
              </div>
              <button
                type="button"
                onClick={() => setStepUpAction(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              {stepUpAction.kind === 'role' &&
                `Change role for ${stepUpAction.admin.email} to ${stepUpAction.newRole.toUpperCase()}?`}
              {stepUpAction.kind === 'revoke' &&
                `Immediately revoke studio access and active sessions for ${stepUpAction.admin.email}?`}
              {stepUpAction.kind === 'restore' &&
                `Restore active studio access for ${stepUpAction.admin.email}?`}
              {stepUpAction.kind === 'reset2fa' &&
                `Reset Google Authenticator 2FA for ${stepUpAction.admin.email}? Their active sessions will terminate immediately.`}
            </p>

            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold font-mono">
                Enter Your 6-Digit Authenticator Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                placeholder="000000"
                value={stepUpOtp}
                onChange={(e) => setStepUpOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full py-2.5 px-4 text-center text-lg tracking-[0.35em] font-mono bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStepUpAction(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingAction}
                className="px-5 py-2 rounded-xl font-semibold bg-amber-500 text-black hover:bg-amber-400 cursor-pointer disabled:opacity-50"
              >
                {processingAction ? 'Confirming...' : 'Authorize Action'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
