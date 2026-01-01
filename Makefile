.PHONY: add-ui-components setup-hooks

add-ui-components:
	pnpm dlx shadcn@latest add alert-dialog \
		avatar \
		badge \
		button \
		card \
		combobox \
		dialog \
		dropdown-menu \
		empty \
		field \
		input-group \
		input \
		label \
		popover \
		scroll-area \
		select \
		separator \
		sheet \
		sidebar \
		skeleton \
		sonner \
		spinner \
		switch \
		table \
		tabs \
		textarea \
		tooltip

setup-hooks:
	git config core.hooksPath .githooks
	@echo "Git hooks configured to use .githooks directory"
