
'use client';
import { useState } from 'react';
import type { Achievement, AchievementTier } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Medal, Gem, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';


const tierStyles: { [key in AchievementTier]: { card: string, iconContainer: string, icon: string, title: string } } = {
    bronze: { 
        card: 'border-amber-700/30 bg-amber-950/10',
        iconContainer: 'bg-amber-700/10',
        icon: 'text-amber-600',
        title: 'text-amber-600',
    },
    silver: { 
        card: 'border-slate-400/40 bg-slate-900/10',
        iconContainer: 'bg-slate-400/10',
        icon: 'text-slate-400',
        title: 'text-slate-400'
    },
    gold: { 
        card: 'border-yellow-500/40 bg-yellow-900/10',
        iconContainer: 'bg-yellow-500/10',
        icon: 'text-yellow-500',
        title: 'text-yellow-500',
    },
    special: { 
        card: 'border-primary/40 bg-primary-950/10 animated-special-border',
        iconContainer: 'bg-primary/10',
        icon: 'text-primary',
        title: 'text-primary',
    },
};

const tierIcons: { [key in AchievementTier]: React.ReactNode } = {
    bronze: <Award className="h-6 w-6" />,
    silver: <Medal className="h-6 w-6" />,
    gold: <Gem className="h-6 w-6" />,
    special: <Sparkles className="h-6 w-6" />,
};

const tierUnlockedCountText: { [key in AchievementTier]: string } = {
    bronze: 'Basic milestones to get you started.',
    silver: 'Great consistency and dedication.',
    gold: 'Truly impressive achievements.',
    special: 'Legendary and unique feats.',
};


const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const isUnlocked = achievement.isUnlocked;
    const styles = tierStyles[achievement.tier];
    
    return (
        <div className={cn(
            'flex items-center gap-4 transition-all duration-300 p-3 rounded-lg',
            isUnlocked ? '' : 'opacity-50'
        )}>
            <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-lg shrink-0',
                isUnlocked ? styles.iconContainer : 'bg-muted-foreground/10'
            )}>
                <div className={cn(isUnlocked ? styles.icon : 'text-muted-foreground')}>
                    {achievement.icon}
                </div>
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-card-foreground">{achievement.title}</h4>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
        </div>
    );
};


export function AchievementCategory({ title, achievements, tier }: { title: string, achievements: Achievement[], tier: AchievementTier }) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const unlockedCount = achievements.filter(a => a.isUnlocked).length;
    const totalCount = achievements.length;
    const visibleAchievements = isExpanded ? achievements : achievements.slice(0, 3);
    const styles = tierStyles[tier];

    return (
        <Card className={cn("flex flex-col", styles.card)}>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className={cn('h-10 w-10 flex items-center justify-center rounded-lg', styles.iconContainer, styles.icon)}>
                        {tierIcons[tier]}
                    </div>
                    <div>
                        <CardTitle className={cn('text-xl', styles.title)}>{title}</CardTitle>
                        <CardDescription>
                            {unlockedCount} / {totalCount} Unlocked. {tierUnlockedCountText[tier]}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
                {visibleAchievements.map(ach => (
                    <AchievementCard key={ach.id} achievement={ach} />
                ))}
            </CardContent>
            {totalCount > 3 && (
                <CardFooter>
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? 'View Less' : 'View More'}
                        {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
