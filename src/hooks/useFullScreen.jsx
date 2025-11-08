import { useState, useLayoutEffect } from 'react';

// 輔助函數：取得不同瀏覽器的 fullscreenElement
function getFullscreenElement() {
  return document.fullscreenElement ||
         document.webkitFullscreenElement ||
         document.mozFullScreenElement ||
         document.msFullscreenElement;
}

// 輔助函數：請求全螢幕
function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

// 輔助函數：退出全螢幕
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

/**
 * 監控和切換全螢幕模式的 Hook
 * @param {React.RefObject<HTMLElement>} ref - 你想要全螢幕的元素的 ref
 */
export function useFullscreen(ref) {
  const [isFullscreen, setIsFullscreen] = useState(!!getFullscreenElement());

  // 監聽全螢幕變化事件 (例如按 Esc 鍵)
  useLayoutEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!getFullscreenElement());
    }

    // 監聽各種瀏覽器的事件名稱
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
    };
  }, []);

  // 切換全螢幕的函數
  const toggleFullscreen = async () => {
    // 1. 如果 ref 存在，就用 ref.current；否則，就用 document.documentElement
    const element = ref?.current || document.documentElement;

    if (isFullscreen) {
      await exitFullscreen();
      // 退出全螢幕時嘗試解除螢幕鎖定 (如果有的話)
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    } else {
      // 2. 這裡使用我們剛才定義的 element
      await requestFullscreen(element);
      
      // 進入全螢幕後，嘗試鎖定為橫向
      // 這是你的遊戲遙控器很可能需要的功能
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      } catch (err) {
        console.warn('無法鎖定螢幕方向:', err);
      }
    }
};

  return [isFullscreen, toggleFullscreen];
}