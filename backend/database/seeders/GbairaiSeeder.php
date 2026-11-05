<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Gbairai;
use App\Models\Like;
use App\Services\DeviceService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GbairaiSeeder extends Seeder
{
    public function run(): void
    {
        $deviceService = app(DeviceService::class);

        $fakeDevices = [
            $deviceService->hashDeviceId((string) Str::uuid()),
            $deviceService->hashDeviceId((string) Str::uuid()),
            $deviceService->hashDeviceId((string) Str::uuid()),
            $deviceService->hashDeviceId((string) Str::uuid()),
        ];

        $samples = [
            [
                'content' => "J'ai fait croire à toute ma belle-famille à Cotonou que j'avais un master en finance alors que j'ai juste fait 6 mois de tuto YouTube sur Excel et le dropshipping. Aujourd'hui je gère la tontine du quartier 😭",
                'location' => 'Cotonou',
                'likes' => 42,
                'comments' => [
                    ['pseudo' => 'Anonyme_1', 'content' => "Génie pur ! Ne change rien tant que les comptes sont bons 😂"],
                    ['pseudo' => 'Anonyme_2', 'content' => "Pardon ne viens pas fuir avec l'argent de la tontine deh !"],
                ],
            ],
            [
                'content' => "À Bohicon, hier soir au carrefour, j'ai vu mon prof de philo du lycée en train de négocier le prix d'un poulet bicyclette comme si sa vie en dépendait. Il a utilisé l'allégorie de la caverne pour avoir 500F de réduction.",
                'location' => 'Bohicon',
                'likes' => 78,
                'comments' => [
                    ['pseudo' => 'Anonyme_1', 'content' => "MDRRR la philosophie pratique en action ! 🐔"],
                    ['pseudo' => 'Auteur (OP)', 'content' => "Et le pire c'est que la vendeuse a cédé !"],
                ],
            ],
            [
                'content' => "Chaque vendredi à Porto-Novo, je dis à mes amis que je vais à l'église pour la veillée de prière, mais en réalité je vais manger du Kpanman et boire du bon sodabi frais chez Da Clémentine au bord de la lagune.",
                'location' => 'Porto-Novo',
                'likes' => 19,
                'comments' => [
                    ['pseudo' => 'Anonyme_1', 'content' => "Dieu voit ton cœur mon frère 🙏🏾😂"],
                ],
            ],
            [
                'content' => "À l'UAC (Calavi), mon binôme de mémoire a disparu depuis 3 semaines. Il réapparaît ce matin pour me demander si j'ai fini la soutenance pour qu'on aille imprimer ensemble. J'ai envie de le dénoncer au jury direct !",
                'location' => 'Abomey-Calavi',
                'likes' => 105,
                'comments' => [
                    ['pseudo' => 'Anonyme_1', 'content' => "Enlève son nom sur la page de garde sans pitié !"],
                    ['pseudo' => 'Anonyme_2', 'content' => "Classique à Calavi ça... courage bro."],
                ],
            ],
            [
                'content' => "Il y a un chauffeur de Zemidjan à Parakou qui met du jazz doux le matin et offre des bonbons menthe à ses clients. Si vous tombez sur lui, donnez-lui double tarif, c'est une légende vivante.",
                'location' => 'Parakou',
                'likes' => 63,
                'comments' => [
                    ['pseudo' => 'Anonyme_1', 'content' => "Je le connais ! Vers le grand marché, trop respectueux le monsieur."],
                ],
            ],
        ];

        foreach ($samples as $index => $item) {
            $authorHash = $fakeDevices[$index % count($fakeDevices)];

            $gbairai = Gbairai::create([
                'device_id_hash' => $authorHash,
                'content' => $item['content'],
                'location' => $item['location'],
                'likes_count' => $item['likes'],
                'reports_count' => 0,
                'status' => 'active',
                'created_at' => now()->subHours($index * 2 + 1),
            ]);

            foreach ($item['comments'] as $cIndex => $commentData) {
                $commenterHash = $commentData['pseudo'] === 'Auteur (OP)'
                    ? $authorHash
                    : $fakeDevices[($index + $cIndex + 1) % count($fakeDevices)];

                Comment::create([
                    'gbairai_id' => $gbairai->id,
                    'device_id_hash' => $commenterHash,
                    'random_pseudo' => $commentData['pseudo'],
                    'content' => $commentData['content'],
                    'created_at' => now()->subMinutes(($index + 1) * 15 - $cIndex * 5),
                ]);
            }
        }
    }
}

