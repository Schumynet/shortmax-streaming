import { useState, useEffect, useCallback } from 'react';
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    setDramas([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    
    fetch(`/api/foryou?page=1&lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        const list = data.data || [];
        setDramas(list);
        setHasMore(list.length >= 20);
        setPage(2);
      })
      .finally(() => setLoading(false));
  }, [lang]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    fetch(`/api/foryou?page=${page}&lang=${lang}`)
      .then(res => res.json())
      .then(data => {
        const list = data.data || [];
        setDramas(prev => [...prev, ...list]);
        setHasMore(list.length >= 20);
        setPage(p => p + 1);
      })
      .finally(() => setLoading(false));
  }, [page, lang, loading, hasMore]);

  return { dramas, loading, hasMore, loadMore };
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

export const useVipDramas = () => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    const fetchVip = async () => {
      try {
        const response = await fetch(`/api/feed/vip?lang=${lang}`);
        const data = await response.json();
        const items = data.data || [];
        if (items[0]?.items) {
          setDramas(items.flatMap((s: any) => s.items));
        } else {
          setDramas(items);
        }
      } catch (error) {
        console.error('Error fetching VIP dramas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVip();
  }, [lang]);

  return { dramas, loading };
};

export const useRomanceDramas = () => {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    const fetchRomance = async () => {
      try {
        const response = await fetch(`/api/feed/romance?lang=${lang}`);
        const data = await response.json();
        setDramas(data.data || []);
      } catch (error) {
        console.error('Error fetching romance dramas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRomance();
  }, [lang]);

  return { dramas, loading };
};
