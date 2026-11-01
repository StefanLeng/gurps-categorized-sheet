/** Ephemeral presentation state only. Never copy editable actor values over fresh data. */
export class SheetViewState {
    private expanded = new Map<string, boolean>();
    private scroll = new Map<string, [number, number]>();
    private focus: string | null = null;

    private key(el: HTMLElement): string {
        const parts: string[] = [];
        let parent: HTMLElement | null = el;
        while (parent) {
            if (parent.dataset.tab) parts.unshift(parent.dataset.tab);
            parent = parent.parentElement;
        }
        const entry = el.closest<HTMLElement>('[data-key]');
        const origin = el.closest<HTMLElement>('[data-slcs-origin]')?.dataset.slcsOrigin;
        return (
            (origin ?? parts.join('/')) +
            ':' +
            (entry?.dataset.key ?? '') +
            ':' +
            (el.dataset.slcsPanel ?? el.getAttribute('name') ?? el.id ?? '') +
            ':' +
            Array.from(el.classList)
                .filter((c) => c !== 'active')
                .sort()
                .join('.') +
            ':' +
            (el instanceof HTMLDetailsElement ? el.querySelector('summary')?.textContent?.trim() : '')
        );
    }

    capture(root: HTMLElement): void {
        root.querySelectorAll<HTMLDetailsElement>('details.skill-name').forEach((el) => {
            this.expanded.set(this.key(el), el.open);
        });
        root.querySelectorAll<HTMLElement>(
            '.slcs-col,.slcs-main,.slcs-combatContent,.tab[data-tab],.window-content,.slcs-workspace,.slcs-tactical-aside,.slcs-workspace-panel',
        ).forEach((el) => {
            if (el.getClientRects().length)
                this.scroll.set((root.dataset.slcsLayout ?? 'standard') + ':' + this.key(el), [
                    el.scrollLeft,
                    el.scrollTop,
                ]);
        });
        const active = document.activeElement;
        this.focus = active instanceof HTMLElement && root.contains(active) ? this.key(active) : null;
    }

    restore(root: HTMLElement): void {
        root.querySelectorAll<HTMLDetailsElement>('details.skill-name').forEach((el) => {
            const open = this.expanded.get(this.key(el));
            if (open !== undefined) el.open = open;
        });
        root.querySelectorAll<HTMLElement>(
            '.slcs-col,.slcs-main,.slcs-combatContent,.tab[data-tab],.window-content,.slcs-workspace,.slcs-tactical-aside,.slcs-workspace-panel',
        ).forEach((el) => {
            const position = this.scroll.get((root.dataset.slcsLayout ?? 'standard') + ':' + this.key(el));
            if (position) {
                el.scrollLeft = position[0];
                el.scrollTop = position[1];
            }
        });
        if (this.focus) {
            const el = Array.from(root.querySelectorAll<HTMLElement>('button,a,input,select,textarea,summary')).find(
                (candidate) => this.key(candidate) === this.focus,
            );
            el?.focus({ preventScroll: true });
        }
    }
}
