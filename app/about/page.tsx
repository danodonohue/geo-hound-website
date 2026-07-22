import type { Metadata } from 'next';
import Link from 'next/link';
import { InstallCta } from '@/components/InstallCta';
import { MAPSCALING_URL, PODCAST_URL } from '@/lib/constants';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Geo Hound is a MapScaping product, built by a GIS specialist tired of digging through network requests to find the data behind a web map. Here is the story.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={`gh-wrap ${styles.inner}`}>
        <article className="gh-prose">
          <span className="gh-label gh-eyebrow">About</span>
          <h1>You have better things to do than read network requests.</h1>

          <p className={styles.lede}>
            Finding the data behind a public web map was a pain even for me, and I do this
            for a living.
          </p>

          <p>
            The routine went like this. Open developer tools. Watch the network requests
            scroll past. Guess which one is the service. Copy it. Clean up the URL. Paste it
            into QGIS and hope. If it did not work, go back and guess again.
          </p>

          <p>
            Every GIS person I know has done this, and every one of them has lost an
            afternoon to it. The information was never hidden, exactly. The map drew itself
            with it, right in front of you. It was just buried under a pile of requests that
            nobody should have to read.
          </p>

          <p>
            So I built Geo Hound to make that automatic. Browse the map, and the services are
            just caught, saved with their metadata, and formatted for QGIS or ArcGIS Pro. No
            developer tools. No guessing.
          </p>

          <h2>Then the idea grew</h2>

          <p>
            The detector was for people like me: GIS people who want the data in their own
            software. But that is not who most web map visitors are.
          </p>

          <p>
            Most people looking at a public web map will never install QGIS. Not because they
            are not smart enough, but because desktop GIS is a cliff, and their question is
            small. Which district has the most consented wells? How far is this from that? Is
            my place in the flood zone? They are staring at a map that contains the answer and
            cannot ask it anything.
          </p>

          <p>
            So instead of only helping GIS people take data back to their software, why not
            bring the GIS to where people already are? We built a workbench into the browser:
            real layers, a real attribute table, real analysis. Then we put an assistant on
            top of it, so you can ask a map a question in plain English and get an answer and
            a map back.
          </p>

          <p>
            That is the arc: it started as &ldquo;help GIS people grab data&rdquo; and turned
            into &ldquo;give everyone their own GIS analyst in the browser&rdquo;. Both halves
            are still there, and both are free.
          </p>

          <h2>MapScaping</h2>

          <p>
            Geo Hound is a <a href={MAPSCALING_URL}>MapScaping</a> product. MapScaping is also
            the home of the <a href={PODCAST_URL}>MapScaping Podcast</a>, which has spent
            years talking to people across the geospatial industry about what they build and
            why.
          </p>

          <p>
            A lot of Geo Hound comes out of those conversations, and out of the same
            frustration turning up again and again in different accents. The tools are good.
            The data is public. Getting from one to the other is harder than it needs to be.
          </p>

          <h2>How it is paid for</h2>

          <p>
            The detector and the workbench are free, and there is no account. They do not cost
            us anything per user, so they do not cost you anything.
          </p>

          <p>
            The assistant does cost money per question, because it calls a model, so that is
            the part you can pay for: up to ten free questions a month, and after that credits
            you buy once that never expire. No subscription. That is the whole business model,
            and it is on the <Link href="/pricing">pricing page</Link> with no small print.
          </p>

          <p>
            There is no advertising, no data selling, and no tracking in the extension. Your
            browsing is not the product. The <Link href="/privacy">privacy policy</Link> is
            written in plain language and says exactly what happens.
          </p>
        </article>

        <aside className={`${styles.cta} gh-ticks`}>
          <div>
            <h2 className={styles.ctaTitle}>Two ways to go from here.</h2>
            <p className={styles.ctaBody}>
              Install it and see what is behind the maps you already look at. Or, if you want
              this on your own web map, we take custom work.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <InstallCta />
            <Link href="/services" className="gh-btn gh-btn--lg">
              Custom work
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
