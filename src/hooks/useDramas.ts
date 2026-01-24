import { useState, useEffect } from 'react';
import { useLanguage } from '../store/language';

export interface Drama {
  id: number;
  code: number;
  name: string;
  cover: string;
  episodes: number;
  summary?: string;
}

export const useDramas = () => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    const fetchDramas = async () => {
      try {
        const response = await fetch(`/api/foryou?page=1&lang=${lang}`);
        const data = await response.json();
        setDramas(data.data || []);
      } catch (error) {
        console.error('Error fetching dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDramas();
  }, [lang]);

  return { dramas, loading };
};

export const useHomeDramas = (tab: number = 1) => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    const fetchDramas = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/home?tab=${tab}&lang=${lang}`);
        const data = await response.json();
        setDramas(data.data || []);
      } catch (error) {
        console.error('Error fetching home dramas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDramas();
  }, [tab, lang]);

  return { dramas, loading };
};

export const useDramaDetail = (code: string | undefined) => {
  const [drama, setDrama] = useState<Drama | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    if (!code) return;

    const fetchDetail = async () => {
      try {
        const response = await fetch(`/api/detail/${code}?lang=${lang}`);
        const data = await response.json();
        setDrama(data.data);
      } catch (error) {
        console.error('Error fetching drama detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [code, lang]);

  return { drama, loading };
};

export const useVideoPlayer = (code: string | undefined, episode: number) => {
  const [videoData, setVideoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    if (!code) return;

    const fetchVideo = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/play/${code}?ep=${episode}&lang=${lang}`);
        const data = await response.json();
        setVideoData(data.data);
      } catch (error) {
        console.error('Error fetching video:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [code, episode, lang]);

  return { videoData, loading };
};
