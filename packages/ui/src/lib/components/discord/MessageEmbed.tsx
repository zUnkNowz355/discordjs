import type { PropsWithChildren, ReactNode } from 'react';
import { DiscordMessageEmbedAuthor, type IDiscordMessageEmbedAuthor } from './MessageEmbedAuthor.js';
import type { IDiscordMessageEmbedField } from './MessageEmbedField.js';
import { DiscordMessageEmbedFields } from './MessageEmbedFields.js';
import { DiscordMessageEmbedFooter, type IDiscordMessageEmbedFooter } from './MessageEmbedFooter.js';
import { DiscordMessageEmbedImage, type IDiscordMessageEmbedImage } from './MessageEmbedImage.js';
import { DiscordMessageEmbedThumbnail, type IDiscordMessageEmbedThumbnail } from './MessageEmbedThumbnail.js';
import { DiscordMessageEmbedTitle, type IDiscordMessageEmbedTitle } from './MessageEmbedTitle.js';

export interface IDiscordMessageEmbed {
	readonly author?: IDiscordMessageEmbedAuthor | undefined;
	readonly authorNode?: ReactNode | undefined;
	readonly fields?: IDiscordMessageEmbedField[];
	readonly footer?: IDiscordMessageEmbedFooter | undefined;
	readonly footerNode?: ReactNode | undefined;
	readonly image?: IDiscordMessageEmbedImage;
	readonly thumbnail?: IDiscordMessageEmbedThumbnail;
	readonly title?: IDiscordMessageEmbedTitle | undefined;
	readonly titleNode?: ReactNode | undefined;
}

export function DiscordMessageEmbed({
	author,
	authorNode,
	fields,
	title,
	titleNode,
	image,
	children,
	thumbnail,
	footer,
	footerNode,
}: PropsWithChildren<IDiscordMessageEmbed>) {
	return (
		<div className="py-0.5" id="outer-embed-wrapper">
			<div className="grid max-w-max border-l-4 border-l-blurple rounded bg-[rgb(47_49_54)]" id="embed-wrapper">
				<div className="max-w-128 flex">
					<div className="pb-4 pl-3 pr-4 pt-2">
						{author ? <DiscordMessageEmbedAuthor {...author} /> : (authorNode ?? null)}
						{title ? <DiscordMessageEmbedTitle {...title} /> : (titleNode ?? null)}
						{children ? <div className="mt-2 text-sm">{children}</div> : null}
						{fields ? <DiscordMessageEmbedFields fields={fields} /> : null}
						{image ? <DiscordMessageEmbedImage {...image} /> : null}
						{footer ? <DiscordMessageEmbedFooter {...footer} /> : (footerNode ?? null)}
					</div>

					{thumbnail ? <DiscordMessageEmbedThumbnail {...thumbnail} /> : null}
				</div>
			</div>
		</div>
	);
}
