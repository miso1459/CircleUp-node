	<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Checkbox } from '$lib/components/ui/checkbox';

	let { data } = $props();

	interface UserEdit {
		role: string;
		lang: string;
		isActive: boolean;
	}

	// Track only the edits (diffs from server data), initialized from props
	let edits = $state<Record<string, UserEdit>>({});

	// Initialize edits in $effect – avoids state_unsafe_mutation from template mutation
	$effect(() => {
		const next: Record<string, UserEdit> = {};
		for (const u of data.users) {
			next[u.id] = { role: u.role, lang: u.lang, isActive: u.isActive };
		}
		edits = next;
	});

	const roleOptions = ['guest', 'user', 'admin'];
	const langOptions = ['ko', 'en'];
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">{m.admin_users_title()}</h2>
		<p class="mt-1 text-sm text-muted-foreground">Manage user roles and language preferences</p>
	</div>

	<div class="rounded-2xl border border-border/50 bg-card overflow-hidden">
		<Table>
			<TableHeader>
				<TableRow class="bg-muted/50 hover:bg-muted/50">
					<TableHead class="font-medium">{m.admin_users_email()}</TableHead>
					<TableHead class="font-medium">{m.admin_users_name()}</TableHead>
					<TableHead class="font-medium">{m.admin_users_role()}</TableHead>
					<TableHead class="font-medium">{m.admin_users_lang()}</TableHead>
					<TableHead class="font-medium">{m.admin_users_is_active()}</TableHead>
					<TableHead class="w-32"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each data.users as user (user.id)}
					{@const edit = edits[user.id] ?? { role: user.role, lang: user.lang, isActive: user.isActive }}
					{@const hasChanges = edit.role !== user.role || edit.lang !== user.lang || edit.isActive !== user.isActive}
					<TableRow class="transition-colors hover:bg-muted/40">
						<TableCell class="font-medium">
							{user.email}
						</TableCell>
						<TableCell>{user.name}</TableCell>
						<TableCell>
							<div class="flex items-center gap-2">
								<Badge
									variant={user.role === 'admin' ? 'default' : user.role === 'guest' ? 'outline' : 'secondary'}
									class="hidden rounded-md sm:inline-flex"
								>
									{user.role}
								</Badge>
								<Select
									type="single"
									value={edit.role}
									onValueChange={(v: string) => {
										edit.role = v;
									}}
								>
									<SelectTrigger class="w-28">
										{edit.role}
									</SelectTrigger>
									<SelectContent>
										{#each roleOptions as role (role)}
											<SelectItem value={role}>{role}</SelectItem>
										{/each}
									</SelectContent>
								</Select>
							</div>
						</TableCell>
						<TableCell>
							<Select
								type="single"
								value={edit.lang}
								onValueChange={(v: string) => {
									edit.lang = v;
								}}
							>
								<SelectTrigger class="w-20">
									{edit.lang}
								</SelectTrigger>
								<SelectContent>
									{#each langOptions as lang (lang)}
										<SelectItem value={lang}>{lang}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</TableCell>
						<TableCell>
							<Checkbox
								checked={edit.isActive}
								onCheckedChange={(v: boolean) => {
									edit.isActive = v;
								}}
							/>
						</TableCell>
						<TableCell>
							<div class="flex items-center gap-2">
								<form method="POST" action="?/updateUser">
									<input type="hidden" name="userId" value={user.id} />
									<input type="hidden" name="name" value={user.name} />
									<input type="hidden" name="role" value={edit.role} />
									<input type="hidden" name="lang" value={edit.lang} />
									<input type="hidden" name="isActive" value={edit.isActive} />
									<Button type="submit" disabled={!hasChanges} class="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
										{m.admin_users_save()}
									</Button>
								</form>
								{#if user.role === 'guest'}
									<form method="POST" action="?/deleteUser">
										<input type="hidden" name="userId" value={user.id} />
										<Button type="submit" variant="destructive" size="sm" class="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
											{m.common_delete()}
										</Button>
									</form>
								{/if}
							</div>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
</div>
