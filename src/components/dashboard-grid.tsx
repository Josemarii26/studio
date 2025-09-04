
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

const gridItems = [
    { type: 'image', src: 'https://picsum.photos/800/600', hint: 'healthy food', className: 'col-span-2 row-span-2' },
    { type: 'stat', title: 'Avg. Calories', value: '2,145' },
    { type: 'image', src: 'https://picsum.photos/600/800', hint: 'fitness activity', className: 'row-span-2' },
    { type: 'stat', title: 'Streak', value: '12 Days' },
    { type: 'image', src: 'https://picsum.photos/800/800', hint: 'meal prep', className: 'col-span-2 row-span-2' },
    { type: 'image', src: 'https://picsum.photos/600/400', hint: 'vegetables variety', className: '' },
    { type: 'image', src: 'https://picsum.photos/600/800', hint: 'hydration water', className: 'row-span-2' },
    { type: 'stat', title: 'Goal', value: 'Lose Weight' },
    { type: 'image', src: 'https://picsum.photos/800/600', hint: 'running sunset', className: 'col-span-2 row-span-2' },
    { type: 'image', src: 'https://picsum.photos/600/600', hint: 'healthy breakfast', className: '' },
];


export function DashboardGrid() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

  return (
    <div className="masonry-grid">
        {gridItems.map((item, index) => (
            <Card key={index} className={`masonry-item overflow-hidden ${item.className || ''}`}>
                <CardContent className="p-0 relative">
                   {item.type === 'image' ? (
                        <div className="relative w-full h-full aspect-[4/3] overflow-hidden">
                            <Image
                                src={item.src}
                                alt={item.hint}
                                data-ai-hint={item.hint}
                                fill
                                className="object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-4 bg-muted/50 aspect-square">
                            <h3 className="text-sm text-muted-foreground">{item.title}</h3>
                            <p className="text-3xl font-bold text-primary">{item.value}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        ))}
    </div>
  );
}
