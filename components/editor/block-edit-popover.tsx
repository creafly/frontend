"use client";

import { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BlockStyleEditorInline } from "./block-style-editor";
import { IconTrash } from "@tabler/icons-react";
import { Icon, TypographyMuted } from "@/components/typography";
import type { Block, BlockStyle, CalloutVariant, BadgeVariant } from "@/types";

interface BlockEditPopoverProps {
  block: Block;
  path: string;
  isOpen: boolean;
  onUpdate: (block: Block) => void;
  onDelete: () => void;
  children: ReactNode;
}

export function BlockEditPopover({
  block,
  path,
  isOpen,
  onUpdate,
  onDelete,
  children,
}: BlockEditPopoverProps) {
  const updateField = (field: string, value: unknown) => {
    onUpdate({ ...block, [field]: value } as Block);
  };

  const updateStyle = (newStyle: BlockStyle) => {
    onUpdate({ ...block, style: newStyle } as Block);
  };

  const supportsStyle = block.type !== "spacer" && block.type !== "conditional";
  const blockStyle =
    "style" in block ? (block.style as BlockStyle | undefined) : undefined;

  const getBlockTitle = () => {
    switch (block.type) {
      case "text":
        return "Text Block";
      case "heading":
        return "Heading Block";
      case "image":
        return "Image Block";
      case "button":
        return "Button Block";
      case "spacer":
        return "Spacer";
      case "divider":
        return "Divider";
      case "list":
        return "List Block";
      case "footer":
        return "Footer Block";
      case "header":
        return "Header Block";
      case "link":
        return "Link";
      case "icon":
        return "Icon";
      case "card_container":
        return "Card Container";
      case "card_header":
        return "Card Header";
      case "card_content":
        return "Card Content";
      case "card_footer":
        return "Card Footer";
      case "quote":
        return "Quote";
      case "callout":
        return "Callout";
      case "badge":
        return "Badge";
      case "grid_wrapper":
        return "Grid Layout";
      case "flex_wrapper":
        return "Flex Layout";
      case "section":
        return "Section";
      default:
        return "Block";
    }
  };

  const renderFields = () => {
    switch (block.type) {
      case "text":
        return (
          <div>
            <Label htmlFor={`text-${path}`}>Content</Label>
            <Textarea
              id={`text-${path}`}
              value={block.value}
              onChange={(e) => updateField("value", e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        );

      case "heading":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`heading-level-${path}`}>Level</Label>
              <Select
                value={block.level}
                onValueChange={(value) => updateField("level", value)}
              >
                <SelectTrigger id={`heading-level-${path}`} className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1</SelectItem>
                  <SelectItem value="h2">H2</SelectItem>
                  <SelectItem value="h3">H3</SelectItem>
                  <SelectItem value="h4">H4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`heading-text-${path}`}>Text</Label>
              <Input
                id={`heading-text-${path}`}
                value={block.text}
                onChange={(e) => updateField("text", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        );

      case "image":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`image-url-${path}`}>Image URL</Label>
              <Input
                id={`image-url-${path}`}
                value={block.url}
                onChange={(e) => updateField("url", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`image-alt-${path}`}>Alt Text</Label>
              <Input
                id={`image-alt-${path}`}
                value={block.alt}
                onChange={(e) => updateField("alt", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        );

      case "button":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`button-text-${path}`}>Button Text</Label>
              <Input
                id={`button-text-${path}`}
                value={block.text}
                onChange={(e) => updateField("text", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`button-url-${path}`}>URL</Label>
              <Input
                id={`button-url-${path}`}
                value={block.url}
                onChange={(e) => updateField("url", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        );

      case "spacer":
        return (
          <div>
            <Label htmlFor={`spacer-height-${path}`}>Height (px)</Label>
            <Input
              id={`spacer-height-${path}`}
              type="number"
              value={block.height || 24}
              onChange={(e) =>
                updateField("height", parseInt(e.target.value) || 24)
              }
              className="mt-1"
            />
          </div>
        );

      case "list":
        return (
          <div className="space-y-3">
            <div>
              <Label>List Type</Label>
              <Select
                value={block.ordered ? "ordered" : "unordered"}
                onValueChange={(value) =>
                  updateField("ordered", value === "ordered")
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unordered">Bullet List</SelectItem>
                  <SelectItem value="ordered">Numbered List</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Items (one per line)</Label>
              <Textarea
                value={block.items.join("\n")}
                onChange={(e) =>
                  updateField(
                    "items",
                    e.target.value.split("\n").filter((s) => s.trim())
                  )
                }
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        );

      case "footer":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`footer-company-${path}`}>Company Name</Label>
              <Input
                id={`footer-company-${path}`}
                value={block.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`footer-address-${path}`}>Address</Label>
              <Input
                id={`footer-address-${path}`}
                value={block.address || ""}
                onChange={(e) =>
                  updateField("address", e.target.value || undefined)
                }
                className="mt-1"
              />
            </div>
          </div>
        );

      case "header":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`header-logo-${path}`}>Logo URL</Label>
              <Input
                id={`header-logo-${path}`}
                value={block.logoUrl || ""}
                onChange={(e) =>
                  updateField("logoUrl", e.target.value || undefined)
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`header-title-${path}`}>Title</Label>
              <Input
                id={`header-title-${path}`}
                value={block.title || ""}
                onChange={(e) =>
                  updateField("title", e.target.value || undefined)
                }
                className="mt-1"
              />
            </div>
          </div>
        );

      case "divider":
        return (
          <TypographyMuted>
            No editable properties for divider.
          </TypographyMuted>
        );

      case "link":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`link-url-${path}`}>URL</Label>
              <Input
                id={`link-url-${path}`}
                value={block.url}
                onChange={(e) => updateField("url", e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`link-text-${path}`}>Link Text</Label>
              <Input
                id={`link-text-${path}`}
                value={block.text || ""}
                onChange={(e) => updateField("text", e.target.value || undefined)}
                placeholder="Click here"
                className="mt-1"
              />
            </div>
          </div>
        );

      case "icon":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`icon-name-${path}`}>Icon Name</Label>
              <Select
                value={block.name || ""}
                onValueChange={(value) => updateField("name", value || undefined)}
              >
                <SelectTrigger id={`icon-name-${path}`} className="mt-1">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`icon-url-${path}`}>Custom Icon URL</Label>
              <Input
                id={`icon-url-${path}`}
                value={block.url || ""}
                onChange={(e) => updateField("url", e.target.value || undefined)}
                placeholder="https://example.com/icon.svg"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`icon-size-${path}`}>Size (px)</Label>
              <Input
                id={`icon-size-${path}`}
                type="number"
                value={block.size || 24}
                onChange={(e) => updateField("size", parseInt(e.target.value) || 24)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`icon-color-${path}`}>Color</Label>
              <Input
                id={`icon-color-${path}`}
                type="color"
                value={block.color || "#000000"}
                onChange={(e) => updateField("color", e.target.value)}
                className="mt-1 h-10"
              />
            </div>
          </div>
        );

      case "quote":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`quote-text-${path}`}>Quote Text</Label>
              <Textarea
                id={`quote-text-${path}`}
                value={block.text}
                onChange={(e) => updateField("text", e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`quote-author-${path}`}>Author</Label>
              <Input
                id={`quote-author-${path}`}
                value={block.author || ""}
                onChange={(e) => updateField("author", e.target.value || undefined)}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`quote-title-${path}`}>Author Title</Label>
              <Input
                id={`quote-title-${path}`}
                value={block.authorTitle || ""}
                onChange={(e) => updateField("authorTitle", e.target.value || undefined)}
                placeholder="CEO, Company Inc."
                className="mt-1"
              />
            </div>
          </div>
        );

      case "callout": {
        const calloutVariants: { value: CalloutVariant; label: string }[] = [
          { value: "info", label: "Info" },
          { value: "warning", label: "Warning" },
          { value: "success", label: "Success" },
          { value: "error", label: "Error" },
        ];
        return (
          <div className="space-y-3">
            <div>
              <Label>Variant</Label>
              <Select
                value={block.variant}
                onValueChange={(value) => updateField("variant", value as CalloutVariant)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calloutVariants.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`callout-title-${path}`}>Title</Label>
              <Input
                id={`callout-title-${path}`}
                value={block.title || ""}
                onChange={(e) => updateField("title", e.target.value || undefined)}
                placeholder="Note"
                className="mt-1"
              />
            </div>
            <TypographyMuted className="text-xs">
              Content is managed via nested blocks.
            </TypographyMuted>
          </div>
        );
      }

      case "badge": {
        const badgeVariants: { value: BadgeVariant; label: string }[] = [
          { value: "default", label: "Default" },
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
          { value: "success", label: "Success" },
          { value: "warning", label: "Warning" },
          { value: "error", label: "Error" },
        ];
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`badge-text-${path}`}>Text</Label>
              <Input
                id={`badge-text-${path}`}
                value={block.text}
                onChange={(e) => updateField("text", e.target.value)}
                placeholder="New"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Variant</Label>
              <Select
                value={block.variant || "default"}
                onValueChange={(value) => updateField("variant", value as BadgeVariant)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {badgeVariants.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      }

      case "grid_wrapper":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`grid-columns-${path}`}>Columns</Label>
              <Select
                value={String(block.columns || 2)}
                onValueChange={(value) => updateField("columns", parseInt(value))}
              >
                <SelectTrigger id={`grid-columns-${path}`} className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`grid-rows-${path}`}>Rows</Label>
              <Select
                value={String(block.rows || "auto")}
                onValueChange={(value) => updateField("rows", value === "auto" ? undefined : parseInt(value))}
              >
                <SelectTrigger id={`grid-rows-${path}`} className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="1">1 Row</SelectItem>
                  <SelectItem value="2">2 Rows</SelectItem>
                  <SelectItem value="3">3 Rows</SelectItem>
                  <SelectItem value="4">4 Rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`grid-gap-${path}`}>Gap (px)</Label>
              <Input
                id={`grid-gap-${path}`}
                type="number"
                min={0}
                max={100}
                value={block.gap ?? 16}
                onChange={(e) => updateField("gap", parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`grid-align-${path}`}>Align Items</Label>
              <Select
                value={block.alignItems || "stretch"}
                onValueChange={(value) => updateField("alignItems", value as "start" | "center" | "end" | "stretch")}
              >
                <SelectTrigger id={`grid-align-${path}`} className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stretch">Stretch</SelectItem>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="end">End</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`grid-justify-${path}`}>Justify Items</Label>
              <Select
                value={block.justifyItems || "stretch"}
                onValueChange={(value) => updateField("justifyItems", value as "start" | "center" | "end" | "stretch")}
              >
                <SelectTrigger id={`grid-justify-${path}`} className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stretch">Stretch</SelectItem>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="end">End</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TypographyMuted className="text-xs">
              Drag blocks into this container to add children.
            </TypographyMuted>
          </div>
        );

      case "flex_wrapper":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`flex-direction-${path}`}>Direction</Label>
              <Select
                value={block.direction || "row"}
                onValueChange={(value) => updateField("direction", value as "row" | "column")}
              >
                <SelectTrigger id={`flex-direction-${path}`} className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="row">Row (Horizontal)</SelectItem>
                  <SelectItem value="column">Column (Vertical)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`flex-gap-${path}`}>Gap (px)</Label>
              <Input
                id={`flex-gap-${path}`}
                type="number"
                min={0}
                max={100}
                value={block.gap ?? 16}
                onChange={(e) => updateField("gap", parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`flex-align-${path}`}>Align Items</Label>
              <Select
                value={block.alignItems || "center"}
                onValueChange={(value) => updateField("alignItems", value as "start" | "center" | "end" | "stretch" | "baseline")}
              >
                <SelectTrigger id={`flex-align-${path}`} className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="end">End</SelectItem>
                  <SelectItem value="stretch">Stretch</SelectItem>
                  <SelectItem value="baseline">Baseline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`flex-justify-${path}`}>Justify Content</Label>
              <Select
                value={block.justifyContent || "start"}
                onValueChange={(value) => updateField("justifyContent", value as "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly")}
              >
                <SelectTrigger id={`flex-justify-${path}`} className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="end">End</SelectItem>
                  <SelectItem value="space-between">Space Between</SelectItem>
                  <SelectItem value="space-around">Space Around</SelectItem>
                  <SelectItem value="space-evenly">Space Evenly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`flex-wrap-${path}`}>Wrap</Label>
              <Select
                value={block.wrap || "wrap"}
                onValueChange={(value) => updateField("wrap", value as "wrap" | "nowrap")}
              >
                <SelectTrigger id={`flex-wrap-${path}`} className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wrap">Wrap</SelectItem>
                  <SelectItem value="nowrap">No Wrap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TypographyMuted className="text-xs">
              Drag blocks into this container to add children.
            </TypographyMuted>
          </div>
        );

      case "card_container":
      case "card_header":
      case "card_content":
      case "card_footer":
      case "section":
        return (
          <TypographyMuted>
            Drag blocks into this container to add children.
          </TypographyMuted>
        );

      default:
        return (
          <TypographyMuted>
            This block type is not editable.
          </TypographyMuted>
        );
    }
  };

  const handleOpenChange = () => {};

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div>{children}</div>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        className="w-80 overflow-visible"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{getBlockTitle()}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Icon icon={IconTrash} size="sm" />
            </Button>
          </div>
          <Separator />
          <div className="max-h-100 overflow-y-auto pr-1">
            <div className="space-y-4">
              {renderFields()}

              {supportsStyle && (
                <>
                  <Separator />
                  <BlockStyleEditorInline
                    style={blockStyle}
                    onChange={updateStyle}
                    blockType={block.type}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
