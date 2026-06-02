<!-- Hero Section -->
<section class="relative flex min-h-[70dvh] flex-col items-center justify-center overflow-hidden text-center">
	<!-- Background gradient orbs -->
	<div class="pointer-events-none absolute inset-0">
		<div class="absolute -left-48 top-1/4 size-[500px] rounded-full bg-primary/5 blur-[120px]"></div>
		<div class="absolute -right-48 top-1/3 size-[400px] rounded-full bg-accent/8 blur-[100px]"></div>
		<div class="absolute bottom-0 left-1/2 size-[300px] -translate-x-1/2 rounded-full bg-primary/3 blur-[80px]"></div>
	</div>

	<div class="relative z-10 mx-auto max-w-3xl px-6">
		<!-- Brand mark -->
		<div class="mb-8 flex justify-center">
			<div class="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10" />
					<path d="M8 12h8" />
					<path d="M12 8v8" />
				</svg>
			</div>
		</div>

		<h1 class="text-5xl font-bold tracking-tight text-foreground md:text-7xl">
			Connect. Collaborate.<br />
			<span class="text-primary">Circle Up.</span>
		</h1>

		<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			A modern platform for teams to organize, share, and build together.
			Streamline your workflow with intuitive menus and role-based access.
		</p>

		<div class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
			<a
				href="/login"
				class="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
			>
				Get Started
			</a>
			<a
				href="https://svelte.dev/docs/kit"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex h-12 items-center justify-center rounded-xl border border-border/60 bg-background px-8 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted/60 hover:shadow-sm active:scale-[0.98]"
			>
				Learn More
			</a>
		</div>
	</div>
</section>

<!-- Features Section -->
<section class="py-24">
	<div class="mx-auto max-w-5xl px-6">
		<div class="mb-16 text-center">
			<h2 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Built for modern teams</h2>
			<p class="mx-auto mt-4 max-w-xl text-muted-foreground">
				Everything you need to manage your team's workspace, from menu organization to user roles.
			</p>
		</div>

		<div class="grid gap-6 md:grid-cols-3">
			<!-- Feature 1 -->
			<div class="group rounded-2xl border border-border/50 bg-card p-8 transition-all duration-200 hover:border-primary/20 hover:shadow-md">
				<div class="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="3" width="7" height="7" rx="1" />
						<rect x="14" y="3" width="7" height="7" rx="1" />
						<rect x="3" y="14" width="7" height="7" rx="1" />
						<rect x="14" y="14" width="7" height="7" rx="1" />
					</svg>
				</div>
				<h3 class="mb-2 text-lg font-semibold text-foreground">Menu Management</h3>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Organize your navigation with drag-and-drop. Create folders, set permissions, and reorder items effortlessly.
				</p>
			</div>

			<!-- Feature 2 -->
			<div class="group rounded-2xl border border-border/50 bg-card p-8 transition-all duration-200 hover:border-primary/20 hover:shadow-md">
				<div class="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
						<circle cx="9" cy="7" r="4" />
						<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
						<path d="M16 3.13a4 4 0 0 1 0 7.75" />
					</svg>
				</div>
				<h3 class="mb-2 text-lg font-semibold text-foreground">Role-Based Access</h3>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Control who sees what with granular role assignments. Admin, user, and custom roles supported.
				</p>
			</div>

			<!-- Feature 3 -->
			<div class="group rounded-2xl border border-border/50 bg-card p-8 transition-all duration-200 hover:border-primary/20 hover:shadow-md">
				<div class="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10" />
						<line x1="2" y1="12" x2="22" y2="12" />
						<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
					</svg>
				</div>
				<h3 class="mb-2 text-lg font-semibold text-foreground">Multi-Language</h3>
				<p class="text-sm leading-relaxed text-muted-foreground">
					Support for Korean and English out of the box. Localized content with seamless language switching.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-24">
	<div class="mx-auto max-w-3xl px-6 text-center">
		<div class="rounded-3xl border border-border/50 bg-card p-12 md:p-16">
			<h2 class="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Ready to get started?</h2>
			<p class="mx-auto mt-4 max-w-lg text-muted-foreground">
				Join your team on CircleUp and start building better workflows today.
			</p>
			<div class="mt-8">
				<a
					href="/login"
					class="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
				>
					Sign In to CircleUp
				</a>
			</div>
		</div>
	</div>
</section>
