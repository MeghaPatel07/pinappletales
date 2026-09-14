import { useCallback, useMemo, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { PageHero } from '@/components/sections/PageHero'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { listPodcasts } from '@/content/api'
import { snapshotKeys } from '@/content/snapshot'
import { useContent } from '@/content/useContent'
import { formatDate } from '@/lib/date'
import {
  youtubeEmbedUrl,
  youtubeId,
  youtubeThumbnail,
  youtubeWatchUrl,
} from '@/lib/youtube'
import type { Podcast } from '@/types/content'
import styles from './Podcast.module.css'

export default function PodcastIndex() {
  const load = useCallback(() => listPodcasts(), [])
  const { data, loading, failed } = useContent<Podcast[]>(
    snapshotKeys.podcastIndex,
    load,
  )

  const episodes = useMemo(() => data ?? [], [data])

  return (
    <>
      <PageHero
        eyebrow="Listen & watch"
        title="The Pineappletales podcast"
        lead="Conversations on raising curious, regulated children — what the research says, and what it looks like on an ordinary Tuesday evening."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Podcast' }]}
      />

      <Section>
        <Container>
          {loading && <p className={styles.status}>Loading episodes…</p>}

          {!loading && failed && (
            <p className={styles.status}>
              The episodes could not be loaded just now. Please refresh the page.
            </p>
          )}

          {!loading && !failed && episodes.length === 0 && (
            <p className={styles.status}>
              The first episodes are on their way. Do check back soon.
            </p>
          )}

          <ul className={styles.list}>
            {episodes.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} />
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBanner
        title="Have something you would like covered?"
        body="Questions from parents shape most of these episodes. Send yours across."
        primaryLabel="Suggest a topic"
      />
    </>
  )
}

function EpisodeCard({ episode }: { episode: Podcast }) {
  const [playing, setPlaying] = useState(false)
  const videoId = youtubeId(episode.youtubeLink)

  return (
    <li className={styles.episode} id={episode.slug}>
      <article>
        <div className={styles.player}>
          {videoId ? (
            playing ? (
              <iframe
                className={styles.frame}
                src={youtubeEmbedUrl(videoId)}
                title={episode.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              /*
               * A facade rather than an iframe: embedding YouTube directly on
               * every card would pull in around half a megabyte of player code
               * per episode before anyone pressed play. The real embed is
               * mounted on the first click.
               */
              <button
                type="button"
                className={styles.facade}
                onClick={() => setPlaying(true)}
              >
                <img
                  src={youtubeThumbnail(videoId)}
                  alt=""
                  className={styles.thumb}
                  width={480}
                  height={360}
                  loading="lazy"
                />
                <span className={styles.playButton} aria-hidden="true">
                  <Icon name="play" size={26} />
                </span>
                <span className="visually-hidden">Play “{episode.name}”</span>
              </button>
            )
          ) : (
            <a
              className={styles.missing}
              href={episode.youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch this episode on YouTube
            </a>
          )}
        </div>

        <div className={styles.body}>
          <p className={styles.meta}>
            <time dateTime={episode.date}>{formatDate(episode.date)}</time>
          </p>

          <h2 className={styles.title}>{episode.name}</h2>

          {episode.description && (
            <RichText html={episode.description} className={styles.description} />
          )}

          {videoId && (
            <a
              className={styles.watchLink}
              href={youtubeWatchUrl(videoId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch on YouTube
              <Icon name="arrowRight" size={15} />
            </a>
          )}
        </div>
      </article>
    </li>
  )
}
