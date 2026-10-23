import { getPageByKey } from '@/lib/api/contentBlocks';
import { resolveMediaUrl } from '@/lib/utils';

export interface PageBlockData {
  blockType: string;
  contentBlock?: any;
  enabled: boolean;
  sectionPosition?: string;
}

export async function getPageBlocksData(pageKey: string): Promise<PageBlockData[]> {
  try {
    const pageResponse = await getPageByKey(pageKey);
    if (pageResponse?.success && pageResponse?.data?.pageBlocks) {
      return pageResponse.data.pageBlocks
        .filter((pb: any) => pb.enabled && pb.contentBlock?.published)
        .map((pb: any) => ({
          blockType: pb.blockType,
          contentBlock: pb.contentBlock,
          enabled: pb.enabled,
          sectionPosition: pb.sectionPosition,
        }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching blocks for page ${pageKey}:`, error);
    return [];
  }
}

export function getBlockDataForType(blocks: PageBlockData[], blockType: string) {
  const block = blocks.find(b => b.blockType === blockType);
  if (!block || !block.contentBlock) return null;
  
  // Mapear los campos del contentBlock a un formato más fácil de usar
  const data = block.contentBlock;
  return {
    title: data.title,
    description: data.description,
    subtitle: data.subtitle,
    text: data.text,
    image: data.image ? resolveMediaUrl(data.image) : null,
    image1: data.image1 ? resolveMediaUrl(data.image1) : null,
    image2: data.image2 ? resolveMediaUrl(data.image2) : null,
    image3: data.image3 ? resolveMediaUrl(data.image3) : null,
    package5StarsTitle: data.package5StarsTitle,
    package5StarsDescription: data.package5StarsDescription,
    package6StarsTitle: data.package6StarsTitle,
    package6StarsDescription: data.package6StarsDescription,
    package7StarsTitle: data.package7StarsTitle,
    package7StarsDescription: data.package7StarsDescription,
    buttonText: data.buttonText,
    buttonLink: data.buttonLink,
    newsItems: data.newsItems,
  };
}

