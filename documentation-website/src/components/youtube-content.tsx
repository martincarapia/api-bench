import React, {
  lazy,
  Suspense,
  useState,
} from 'react';
import YoutubeLink from './youtube-link.tsx';
import t from './t.ts';
import {
  STRING_PX_OFFSET,
  STRING_START,
  YOUTUBE_DEFAULT_HEIGHT,
  YOUTUBE_DEFAULT_WIDTH,
  YOUTUBE_RECHECK_TIME,
} from '../constants.ts';
import {
  get,
} from './local-consent-storage.ts';

interface YoutubeContentType {
  children: string;
}
const allow = [
  'accelerometer',
  'clipboard-write',
  'encrypted-media',
  'gyroscope',
  'picture-in-picture',
  'web-share',
];

const YoutubeContent = ({
  children,
}: YoutubeContentType,) => {
  const [
    allowed,
    setAllowed,
  ] = useState<boolean>(localStorage.getItem('consent-was-given',) === 'true',);
  if (! allowed) {
    const interval = setInterval(() => {
      if (get('youtube',)) {
        clearInterval(interval,);
        setAllowed(true,);
      }
    }, YOUTUBE_RECHECK_TIME,);
    return <YoutubeLink>{children}</YoutubeLink>;
  }
  const EL = lazy(async() => {
    const title = await t('youtube.player',);
    const id = 'youtube_' + children;
    const setHeightOnLoad = () => {
      const element = document.getElementById(id,);
      if (! element) {
        return;
      }
      const computed = getComputedStyle(element,);
      const widthString = computed.getPropertyValue('width',);
      const width= Number.parseFloat(
        widthString.substring(
          STRING_START,
          widthString.length - STRING_PX_OFFSET,
        ),
      );
      const factor = YOUTUBE_DEFAULT_HEIGHT / YOUTUBE_DEFAULT_WIDTH;
      element.setAttribute(
        'height',
        `${ Math.ceil(width * factor,) }`,
      );
    };
    return {
      default: () => <>
        <iframe
          id={id}
          src={`https://www.youtube-nocookie.com/embed/${ children }`}
          title={title}
          allow={allow.join(';',)}
          onLoad={setHeightOnLoad}
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen></iframe>
        <YoutubeLink>{children}</YoutubeLink>
      </>,
    };
  },);
  return <Suspense fallback={<YoutubeLink>{children}</YoutubeLink>}>
    <EL/>
  </Suspense>;
};

export default YoutubeContent;
