'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { RichText } from '@/components/ui/RichText'
import { formatDate } from '@/lib/date'
import { youtubeEmbedUrl, youtubeId, youtubeThumbnail, youtubeWatchUrl } from '@/lib/youtube'
import type { Podcast } from '@/types/content'

function EpisodeCard({ episode }: { episode: Podcast }) {
  const [playing, setPlaying] = useState(false)
  const videoId = youtubeId(episode.youtubeLink)

  return (
    <li id={episode.slug} className="grid gap-6 rounded-card border border-line bg-card p-6 md:grid-cols-[minmax(0,320px)_1fr] md:p-8">
      <div className="img-zoom relative overflow-hidden rounded-2xl bg-paper-2" style={{ aspectRatio: '4 / 3' }}>
        {videoId ? (
          playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={youtubeEmbedUrl(videoId)}
              title={episode.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <button type="button" className="group absolute inset-0" onClick={() => setPlaying(true)}>
              <img src={youtubeThumbnail(videoId)} alt="" className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute inset-0 grid place-items-center bg-ink/20 transition-colors group-hover:bg-ink/35">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-brand text-ink">
                  <Icon name="play" size={26} />
                </span>
              </span>
              <span className="sr-only">Play “{episode.name}”</span>
            </button>
          )
        ) : (
          <a
            href={episode.youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 grid place-items-center text-center text-[0.95rem] font-medium text-ink-soft"
          >
            Watch this episode on YouTube
          </a>
        )}
      </div>

      <div className="flex flex-col justify-center gap-2">
        <p className="eyebrow text-ink-soft">
          <time dateTime={episode.date}>{formatDate(episode.date)}</time>
        </p>
        <h2 className="font-display text-[1.3rem] font-semibold leading-[1.2]">{episode.name}</h2>
        {episode.description && <RichText html={episode.description} className="text-[0.95rem]" />}
        {videoId && (
          <a
            href={youtubeWatchUrl(videoId)}
            target="_blank"
            rel="noopener noreferrer"
            className="arrow-move mt-1 inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-ink"
          >
            Watch on YouTube <span className="arrow" aria-hidden>→</span>
          </a>
        )}
      </div>
    </li>
  )
}

export function PodcastList({ episodes }: { episodes: Podcast[] }) {
  return (
    <ul className="flex flex-col gap-8">
      {episodes.map((episode) => (
        <EpisodeCard key={episode.id} episode={episode} />
      ))}
    </ul>
  )
}
