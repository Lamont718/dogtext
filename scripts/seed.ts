
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to create slug from name
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

// Helper function to estimate reading time
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

const breedData = [
  {
    name: 'Labrador Retriever',
    description: 'America\'s most popular dog breed for over three decades. Friendly, outgoing, and high-spirited companions who have more than enough affection to go around for a family looking for a medium-to-large dog.',
    origin: 'Developed in Newfoundland, Canada in the 1500s as fishermen\'s helpers — retrieving fish and dragging nets. Refined into a sporting breed in 19th-century England.',
    physicalCharacteristics: 'Medium-to-large athletic build, 55-80 lbs. Short, dense, water-repellent double coat in yellow, black, or chocolate. Otter-like tail and webbed feet make them excellent swimmers. Average lifespan 10-12 years.',
    temperament: 'Outgoing, even-tempered, gentle, intelligent, and eager to please. Highly social with people and other animals. Patient enough for children, exuberant enough for active adults.',
    exerciseNeeds: 'High — requires at least 60-90 minutes of daily exercise. Loves swimming, fetching, and running. Without enough activity, they can become destructive or gain weight quickly.',
    groomingRequirements: 'Moderate. Brush 1-2 times per week to manage their seasonal heavy shedding. Bathe every 2-3 months or as needed. Regular nail trims and ear checks (their floppy ears can trap moisture).',
    healthConsiderations: 'Prone to hip and elbow dysplasia, exercise-induced collapse, obesity (they\'ll eat anything), and progressive retinal atrophy. Reputable breeders screen for these. Watch food intake carefully.',
    trainingTips: 'One of the easiest breeds to train — eager, food-motivated, and intelligent. Start early with positive reinforcement. They excel at obedience, agility, scent work, and service work. Channel mouthiness into fetch.',
    idealLivingConditions: 'Best with active families who can provide a yard and daily exercise. Adapts to apartments only with sufficient daily activity. Thrives on companionship — not a breed to leave alone all day.',
    sizeCategory: 'large', energyLevel: 'high', groomingLevel: 'moderate', trainability: 'easy',
    familyFriendly: true, goodWithKids: true, goodWithPets: true, isPopular: true,
  },
  {
    name: 'Golden Retriever',
    description: 'Friendly, intelligent, and devoted family dogs known for their gleaming gold coats and sunny dispositions. As eager to please as they are easy to love.',
    origin: 'Developed in 19th-century Scotland by Lord Tweedmouth, who crossed a yellow Retriever with a now-extinct Tweed Water Spaniel to create the ideal hunting companion for the rugged Scottish Highlands.',
    physicalCharacteristics: 'Medium-large, 55-75 lbs, with a sturdy muscular build. Dense water-repellent double coat in shades from light cream to deep gold. Feathered tail and ears. Average lifespan 10-12 years.',
    temperament: 'Gentle, affectionate, patient, and reliable. Goldens famously rarely meet a stranger. Deeply bonded to their families and known for emotional intelligence — popular as therapy and service dogs for good reason.',
    exerciseNeeds: 'High — 60+ minutes daily of active exercise plus mental stimulation. Built for retrieving and swimming. Adolescent Goldens (1-3 years) have especially intense energy needs.',
    groomingRequirements: 'High. Brush 2-3 times weekly, daily during seasonal shedding (twice a year). Their double coat sheds heavily. Bathe monthly. Trim feathering on ears, legs, and tail. Regular ear cleaning prevents infections.',
    healthConsiderations: 'Prone to cancer (one of the highest rates of any breed), hip and elbow dysplasia, heart conditions (subvalvular aortic stenosis), and skin allergies. Annual vet checks and a healthy weight extend lifespan.',
    trainingTips: 'Highly trainable — soft, sensitive, and food-motivated. Use gentle, positive methods; harsh corrections backfire. Start socialization at 8 weeks. They thrive in obedience, agility, dock diving, and therapy work.',
    idealLivingConditions: 'Best with families who include them as full household members. Need a fenced yard or daily long walks. Don\'t do well isolated — separation can lead to anxiety and destructive behavior.',
    sizeCategory: 'large', energyLevel: 'high', groomingLevel: 'high', trainability: 'easy',
    familyFriendly: true, goodWithKids: true, goodWithPets: true, isPopular: true,
  },
  {
    name: 'German Shepherd',
    description: 'Confident, courageous, and remarkably intelligent. The all-purpose worker — used as police, military, guide, and search-and-rescue dogs the world over, while also being devoted family companions.',
    origin: 'Developed in late-1890s Germany by Captain Max von Stephanitz, who sought to create the ideal herding and working dog. Quickly recognized for trainability and versatility, expanded into police and military roles.',
    physicalCharacteristics: 'Large, athletic, 50-90 lbs. Double coat — medium length, dense, weather-resistant. Most commonly black-and-tan, but also sable, all-black, or all-white. Average lifespan 9-13 years.',
    temperament: 'Loyal, courageous, alert, and confident. Reserved with strangers but devoted to family. Strong protective instincts that need careful socialization. Bonds deeply with one or two primary handlers.',
    exerciseNeeds: 'Very high — 90+ minutes daily of physical exercise plus structured mental work. Without enough job-like stimulation, they invent their own jobs (often destructive ones).',
    groomingRequirements: 'Moderate to high. Brush 3-4 times weekly. They shed heavily year-round and "blow coat" twice yearly. Bathe every 2-3 months. Regular nail trims, dental care, and ear checks.',
    healthConsiderations: 'Prone to hip and elbow dysplasia, degenerative myelopathy (a spinal condition), bloat (gastric torsion), and certain cancers. Buy from breeders who screen hips, elbows, and DM genetic status.',
    trainingTips: 'One of the most trainable breeds when started early. Need a confident, consistent handler — not for first-time owners. Excel at advanced obedience, protection sports (Schutzhund/IGP), and scent work.',
    idealLivingConditions: 'Best in homes with experienced owners and a job for them to do. Need a fenced yard. Not suited for apartment life unless owner is committed to extensive daily exercise and mental work.',
    sizeCategory: 'large', energyLevel: 'high', groomingLevel: 'moderate', trainability: 'easy',
    familyFriendly: true, goodWithKids: true, goodWithPets: false, isPopular: true,
  },
  {
    name: 'French Bulldog',
    description: 'Adaptable, playful companions with bat ears, smushed faces, and outsized personalities. The Frenchie is now one of the most popular city dogs in the world thanks to a friendly nature and modest exercise needs.',
    origin: 'Descended from English Bulldogs brought to France by lace-makers in the 1850s, where they were crossed with local terriers and pugs. Became a favorite of Parisian café society in the late 19th century.',
    physicalCharacteristics: 'Small but solidly built, 16-28 lbs. Smooth short coat in fawn, brindle, white, pied, or cream. Distinctive bat ears, flat brachycephalic face, compact muscular body. Average lifespan 10-12 years.',
    temperament: 'Affectionate, easy-going, comedic, and surprisingly quiet — they bark less than most small breeds. Bond deeply with their humans and tend to be one-room dogs who follow you everywhere.',
    exerciseNeeds: 'Low to moderate. Two short walks daily (15-20 min each) plus indoor play. They overheat easily — exercise in cool morning or evening hours, never during summer heat.',
    groomingRequirements: 'Low. Brush weekly with a rubber mitt. Bathe monthly. Critical: clean facial folds 2-3 times per week to prevent dermatitis. Trim nails frequently — they don\'t wear them down naturally.',
    healthConsiderations: 'Brachycephalic breed — prone to BOAS (breathing issues), heat stroke, eye problems, skin fold dermatitis, and IVDD (spinal disc disease). Require C-section births. Avoid air travel and hot weather.',
    trainingTips: 'Intelligent but stubborn. Short, fun, food-motivated sessions work best. Repetition bores them. Early socialization is essential. Prone to selective hearing — make commands worth their while.',
    idealLivingConditions: 'Excellent apartment dogs. Best in moderate climates — vulnerable to both heat and cold. Need climate-controlled environments and an owner home most of the day.',
    sizeCategory: 'small', energyLevel: 'low', groomingLevel: 'low', trainability: 'moderate',
    familyFriendly: true, goodWithKids: true, goodWithPets: true, isPopular: true,
  },
  {
    name: 'Poodle',
    description: 'Astonishingly intelligent, hypoallergenic, and elegant — Poodles come in three sizes (Standard, Miniature, and Toy) and excel at virtually everything from hunting to circus performing to therapy work.',
    origin: 'Originally developed in Germany as a water retriever (the name comes from German "Pudel" meaning "to splash"), then refined and made famous in France. The breed standard dates to the 15th century.',
    physicalCharacteristics: 'Standard 45-70 lbs, Miniature 15-20 lbs, Toy 6-9 lbs. Curly, dense, single-layer coat (low shedding). Solid colors include black, white, apricot, silver, and brown. Lifespan 12-15 years.',
    temperament: 'Brilliantly intelligent, alert, active, and trainable. Affectionate with family, often reserved with strangers. Surprisingly playful and athletic — the show clip masks a serious working dog underneath.',
    exerciseNeeds: 'Moderate to high (size-dependent). Standards need 60+ min/day; Toys are happy with 30 min plus indoor play. All Poodles need mental work — puzzle toys, training, or sport.',
    groomingRequirements: 'High. The curly coat needs professional grooming every 4-6 weeks plus daily brushing to prevent matting. Skip the elaborate show clips — pet clips like the "puppy" or "lamb" cut are equally pretty and practical.',
    healthConsiderations: 'Standards: bloat, hip dysplasia, Addison\'s disease, sebaceous adenitis. Miniatures and Toys: patellar luxation, eye conditions, dental issues. All sizes prone to ear infections from the coat.',
    trainingTips: 'Among the easiest breeds to train — they pick up commands in just a few repetitions. Need mental challenges to stay happy. Excel at obedience, agility, water work, scent work, and tricks.',
    idealLivingConditions: 'Adaptable to apartment or home. Standards do best with a yard. Need to be with their people — Poodles dislike isolation. Hypoallergenic coat makes them suitable for many allergy sufferers.',
    sizeCategory: 'medium', energyLevel: 'high', groomingLevel: 'high', trainability: 'easy',
    familyFriendly: true, goodWithKids: true, goodWithPets: true, isPopular: true,
  },
  {
    name: 'Bulldog',
    description: 'Calm, courageous, and friendly. Despite their sour-mug expression and muscular frame, English Bulldogs are gentle, affectionate, and content to lounge around the house with their families.',
    origin: 'Developed in 13th-century England for the brutal sport of bull-baiting. After the practice was outlawed in 1835, breeders selected for gentler temperaments, transforming the breed into a beloved companion.',
    physicalCharacteristics: 'Medium, stocky, low-slung — 40-50 lbs. Smooth short coat in brindle, white, fawn, pied, or red. Famous wrinkled face, undershot jaw, and rolling gait. Average lifespan 8-10 years.',
    temperament: 'Docile, willful, friendly, and loyal. Patient with children and amiable with strangers. Quiet, low-key — happy to nap on the couch most of the day. Stubborn streak that needs gentle persistence.',
    exerciseNeeds: 'Low. Two short walks daily (20-30 min total). Cannot tolerate heat or strenuous activity. Indoor play is sufficient for many. Watch for overheating — they cannot regulate temperature efficiently.',
    groomingRequirements: 'Moderate. Weekly brushing. Critical: clean facial folds and tail pocket 3-4 times per week to prevent infection. Wipe eyes daily. Bathe monthly. Trim nails regularly.',
    healthConsiderations: 'Many. Brachycephalic syndrome, hip dysplasia, heat sensitivity, skin allergies, cherry eye, IVDD, and reproductive challenges (most require C-sections). Pre-purchase vet exams are essential.',
    trainingTips: 'Slow learners but eventually solid. Short positive sessions with high-value rewards. Stubborn, not stupid — once they decide a command isn\'t worth it, they\'ll dig in. Start early socialization.',
    idealLivingConditions: 'Excellent apartment dogs and ideal for less-active owners. Need climate control — can\'t live outside or in hot regions without AC. Best with owners home much of the day.',
    sizeCategory: 'medium', energyLevel: 'low', groomingLevel: 'moderate', trainability: 'moderate',
    familyFriendly: true, goodWithKids: true, goodWithPets: true, isPopular: true,
  },
  {
    name: 'Beagle',
    description: 'Merry, friendly, curious — Beagles are scent hounds first and foremost, with the nose to prove it. Compact size and easy-going temperament make them popular family dogs, though their voices carry.',
    origin: 'A scent hound breed developed in England, with origins tracing to small pack hounds used for hare hunting since the 14th century. The modern breed was standardized in the mid-1800s.',
    physicalCharacteristics: 'Small to medium, 20-30 lbs. Smooth, dense, weatherproof double coat — most commonly tricolor (black, white, tan) but also red and white, lemon, or chocolate. Lifespan 10-15 years.',
    temperament: 'Cheerful, sociable, food-motivated, and tenacious. Pack-oriented — they love company, both human and canine. Famous howl/bay can be loud. Curious noses lead them into trouble; never trust them off-leash.',
    exerciseNeeds: 'High. 60+ minutes daily — long walks, scent games, secure-yard romps. Without exercise, they become destructive and obese. Their nose drives them, so include sniff-walks (let them lead with the nose).',
    groomingRequirements: 'Low. Weekly brushing handles their moderate shedding. Bathe every 1-2 months. Long ears trap moisture and need weekly cleaning to prevent infections. Trim nails regularly.',
    healthConsiderations: 'Prone to obesity (they\'ll eat anything), epilepsy, hypothyroidism, ear infections, IVDD, and "Beagle pain syndrome" (steroid-responsive meningitis). Watch food intake carefully.',
    trainingTips: 'Smart but stubborn — once a scent catches their nose, recall is gone. Use high-value treats and short sessions. Crate training is essential. Never trust off-leash; always use a long line.',
    idealLivingConditions: 'Adaptable but ideal with a fenced yard (high fences — they\'re escape artists). Apartment-friendly with sufficient exercise, but the howl can be a neighbor problem. Thrive with another dog for company.',
    sizeCategory: 'small', energyLevel: 'high', groomingLevel: 'low', trainability: 'moderate',
    familyFriendly: true, goodWithKids: true, goodWithPets: true, isPopular: true,
  },
  {
    name: 'Rottweiler',
    description: 'Confident, fearless, and good-natured. Originally Roman drovers\' dogs, today\'s Rottweilers are loyal protectors and devoted companions when properly raised, trained, and socialized.',
    origin: 'Descended from Roman cattle-droving Mastiffs that traveled across the Alps with legions around 74 AD. The breed took its name from the German town of Rottweil, where it became the butcher\'s dog of choice.',
    physicalCharacteristics: 'Large to giant, 80-135 lbs. Short, hard, dense double coat — always black with mahogany or rust markings. Powerful muscular build, broad head, and natural bobtail (where legal). Lifespan 9-10 years.',
    temperament: 'Confident, calm, courageous, and aloof with strangers. Deeply loyal to family. Strong guarding instincts that require thoughtful socialization from puppyhood. Not naturally aggressive — but powerful and serious.',
    exerciseNeeds: 'High. 60-90 minutes daily of physical and mental work. Love structured activities like obedience, herding trials, weight pull, and tracking. Bored Rotties become destructive and reactive.',
    groomingRequirements: 'Low. Brush weekly; daily during heavy shedding seasons. Bathe every 2-3 months. Routine nail, dental, and ear care. Their short coat is low-maintenance.',
    healthConsiderations: 'Prone to hip and elbow dysplasia, osteosarcoma (bone cancer), bloat, aortic stenosis, and progressive retinal atrophy. Lifespan is shorter than many breeds — appreciate every year.',
    trainingTips: 'Highly trainable but require a confident handler. Need firm, fair, consistent training from 8 weeks. Not for first-time owners. Excel at obedience, protection sports, herding, and therapy work after maturity.',
    idealLivingConditions: 'House with a fenced yard and an experienced, present owner. Not apartment dogs in most cases. Need to be part of family life — Rotties left in the yard alone become problem dogs.',
    sizeCategory: 'large', energyLevel: 'moderate', groomingLevel: 'low', trainability: 'moderate',
    familyFriendly: true, goodWithKids: true, goodWithPets: false, isPopular: false,
  },
  {
    name: 'Yorkshire Terrier',
    description: 'Tiny but tenacious. Yorkies pack big-dog personality into a 7-pound frame, with silky coats and confidence to spare. Originally bred as ratters, they remain bold, curious companions.',
    origin: 'Developed in 19th-century Yorkshire, England, by working-class weavers who needed small dogs to control rats in mills. Refined into companion dogs as the breed gained popularity with Victorian gentry.',
    physicalCharacteristics: 'Toy size, 4-7 lbs. Long, fine, silky single-layer coat (low-shedding) in steel blue and tan. Compact body, alert ears, V-shaped face. Average lifespan 13-16 years.',
    temperament: 'Bold, confident, affectionate, and feisty. Big personalities in small packages. Devoted to their primary person. Can be territorial and bark-prone without training. Often ignore their own size.',
    exerciseNeeds: 'Low to moderate. Two 15-20 minute walks daily plus indoor play. Tiny size means short legs cover ground slowly — pace accordingly. Avoid extreme weather; they\'re sensitive to cold.',
    groomingRequirements: 'High if kept long, moderate if kept in a "puppy cut." Long coats need daily brushing and topknots. Most pet owners keep them in short "puppy" or "schnauzer" cuts requiring grooming every 4-6 weeks.',
    healthConsiderations: 'Patellar luxation, tracheal collapse (use a harness, never a collar), portosystemic shunt (liver), dental disease (small mouths overcrowd), and hypoglycemia in puppies. Dental cleanings essential.',
    trainingTips: 'Smart but headstrong. Take house-training seriously — small dogs are notoriously hard to potty-train. Use small high-value treats. Don\'t let cuteness excuse bad behavior; tiny dogs need rules too.',
    idealLivingConditions: 'Excellent apartment dogs. Indoor pets — too small and fragile for outdoor living. Best in households without rough children or large dogs. Sensitive to cold weather; sweaters help.',
    sizeCategory: 'toy', energyLevel: 'moderate', groomingLevel: 'high', trainability: 'moderate',
    familyFriendly: true, goodWithKids: false, goodWithPets: true, isPopular: true,
  },
  {
    name: 'Dachshund',
    description: 'Bold, lively, clever — Dachshunds were bred to chase badgers underground, and they\'ve never lost the courage of a much larger dog. Available in two sizes (standard and miniature) and three coats (smooth, longhaired, wirehaired).',
    origin: 'Developed in Germany over centuries (the name means "badger dog") to dig into setts and confront badgers underground. The unique elongated body and short legs are functional, not decorative.',
    physicalCharacteristics: 'Standard 16-32 lbs, Miniature under 11 lbs. Long body, short legs, deep chest. Three coat varieties; many color and pattern combinations. Lifespan 12-16 years.',
    temperament: 'Brave, curious, lively, and stubborn. Devoted to family but can be aloof with strangers. Strong prey drive — small animals trigger their hunting instincts. Often vocal, prone to barking.',
    exerciseNeeds: 'Moderate. Two 20-30 minute walks daily plus play. Avoid jumping on/off furniture and stairs to protect their long backs. Swimming is excellent low-impact exercise.',
    groomingRequirements: 'Coat-dependent. Smooths: weekly brushing. Longhaireds: 2-3x per week to prevent mats. Wirehaireds: weekly brushing plus stripping or trimming every few months. All need ear cleaning.',
    healthConsiderations: 'IVDD (intervertebral disc disease) is the major risk — keep them lean, use ramps, never let them jump from heights. Also prone to obesity, dental issues, and patellar luxation.',
    trainingTips: 'Intelligent but famously stubborn. Short, fun, treat-driven sessions. House-training takes patience. Recall can be unreliable when prey is in sight. Crate training helps with separation.',
    idealLivingConditions: 'Adaptable to apartment or home. Need stairs minimized or use of ramps. Excellent for owners who want a small dog with a big personality. Generally one-person or one-family dogs.',
    sizeCategory: 'small', energyLevel: 'moderate', groomingLevel: 'moderate', trainability: 'moderate',
    familyFriendly: true, goodWithKids: false, goodWithPets: false, isPopular: true,
  },
  {
    name: 'Boxer',
    description: 'Bright, fun-loving, and active. Boxers are upbeat athletes with a permanent puppyish quality — they take years to mature mentally. Loyal family guardians who love being part of the action.',
    origin: 'Developed in 19th-century Germany from the now-extinct Bullenbeisser (a boar-hunting breed) crossed with imported English Bulldogs. Used as cattle dogs, hunters, military messengers, and police dogs.',
    physicalCharacteristics: 'Medium-large, athletic, 50-80 lbs. Smooth short coat in fawn or brindle with white markings. Square jaw with slight underbite, expressive face, muscular build. Lifespan 10-12 years.',
    temperament: 'Playful, loyal, alert, and patient with children — often called the "Peter Pan" of breeds. Energetic and silly into middle age. Excellent watchdogs without being aggressive.',
    exerciseNeeds: 'Very high. 90+ minutes daily of vigorous exercise. Without it, they become hyperactive and destructive. Need cool weather for hard play — sensitive to heat due to their flat faces.',
    groomingRequirements: 'Low. Weekly brushing handles moderate shedding. Bathe every 2-3 months. Wipe facial folds clean. Drool varies by individual; some are heavy droolers.',
    healthConsiderations: 'Cancer (especially mast cell tumors and lymphoma), aortic and subaortic stenosis, hip dysplasia, hypothyroidism, and bloat. Pre-purchase cardiac screening is essential. Lifespans are sadly short.',
    trainingTips: 'Smart and eager but stubborn — they\'re thinkers, not blind followers. Positive methods only; harshness shuts them down. Channel mouthiness early. Excel at agility, obedience, and Schutzhund.',
    idealLivingConditions: 'House with a fenced yard preferred. Apartment-livable with extensive daily exercise. Need cool indoor spaces — not suited for hot climates without AC. Bond deeply, dislike isolation.',
    sizeCategory: 'large', energyLevel: 'high', groomingLevel: 'low', trainability: 'moderate',
    familyFriendly: true, goodWithKids: true, goodWithPets: true, isPopular: false,
  },
  {
    name: 'Siberian Husky',
    description: 'Loyal, mischievous, and outgoing. Bred to pull sleds across the Siberian Arctic, Huskies are pack-oriented endurance athletes with stunning blue or multi-colored eyes and fox-like masks.',
    origin: 'Developed by the Chukchi people of northeastern Siberia over thousands of years as long-distance sled dogs. Imported to Alaska in 1908 for sled-dog racing and gained fame through the 1925 Nome serum run.',
    physicalCharacteristics: 'Medium, athletic, 35-60 lbs. Thick double coat in many color patterns; almond-shaped eyes can be blue, brown, amber, or "bi-eyed" (different colors). Curled tail. Lifespan 12-14 years.',
    temperament: 'Friendly, outgoing, mischievous, and free-spirited. Pack-oriented — they love company. Independent thinkers, not naturally obedient. Famous howlers (rarely barkers). Notorious escape artists.',
    exerciseNeeds: 'Extremely high. 90-120+ minutes daily of vigorous activity. Built for endurance — they need to run. Without enough exercise, they dig, escape, howl, and destroy. Cool weather is their happy place.',
    groomingRequirements: 'Moderate to high. Brush 2-3 times per week. They "blow coat" twice yearly, shedding handfuls daily for 3-6 weeks. Bathe rarely (every 3-4 months) — their coat self-cleans. Never shave.',
    healthConsiderations: 'Prone to hip dysplasia, eye conditions (cataracts, progressive retinal atrophy, juvenile cataracts), and zinc deficiency dermatitis. Generally healthy compared to many breeds.',
    trainingTips: 'Intelligent but independent. Need creative, patient training — they\'ll do something interesting before something obedient. Recall is often unreliable; use long lines. Strong prey drive.',
    idealLivingConditions: 'Active homes with a securely fenced yard (high, dig-proof). Best in cool climates. Not suited to apartments without serious daily exercise. Happiest with a canine companion.',
    sizeCategory: 'medium', energyLevel: 'high', groomingLevel: 'high', trainability: 'challenging',
    familyFriendly: true, goodWithKids: true, goodWithPets: true, isPopular: false,
  },
  {
    name: 'Border Collie',
    description: 'Affectionate, smart, and energetic. Widely regarded as the most intelligent dog breed in the world. Bred to herd sheep across the Anglo-Scottish border, they are workaholics who need a job.',
    origin: 'Developed along the Anglo-Scottish border in the 1700-1800s as the ultimate sheep-herding dog. The breed name became official in 1915 after centuries of refinement for working ability over appearance.',
    physicalCharacteristics: 'Medium, athletic, 30-55 lbs. Two coat varieties (smooth and rough). Most familiar in black-and-white, but accepted in many colors. Intense, focused gaze ("the eye"). Lifespan 12-15 years.',
    temperament: 'Brilliantly intelligent, energetic, alert, and sensitive. Intensely focused — they herd anything that moves, including children. Bond strongly with one handler. Can be neurotic without enough work.',
    exerciseNeeds: 'Extreme — 2+ hours daily of physical exercise PLUS substantial mental work. They need a job. Without it, they invent obsessive behaviors (chasing shadows, fence-running, light-spinning).',
    groomingRequirements: 'Moderate. Brush 2-3 times per week, more during shedding seasons. Bathe every 2-3 months. Their double coat sheds significantly twice yearly. Trim feathering occasionally.',
    healthConsiderations: 'Prone to hip dysplasia, collie eye anomaly, epilepsy, MDR1 drug sensitivity (test before certain medications), and trapped neutrophil syndrome. Reputable breeders test for these.',
    trainingTips: 'The most trainable breed in many trainers\' experience — they learn commands in 1-2 repetitions. Need creative challenges. Excel at agility, herding trials, flyball, obedience, and trick training.',
    idealLivingConditions: 'Active homes with rural/suburban property and an owner who wants a partner in sport, herding, or other work. Not suited to apartments or sedentary households. Need acres of mental stimulation.',
    sizeCategory: 'medium', energyLevel: 'high', groomingLevel: 'moderate', trainability: 'easy',
    familyFriendly: true, goodWithKids: true, goodWithPets: true, isPopular: false,
  },
  {
    name: 'Chihuahua',
    description: 'Tiny, sassy, and devoted. The world\'s smallest breed, Chihuahuas pack outsized personalities into 6-pound bodies and form intense bonds with their chosen humans.',
    origin: 'Descended from the Techichi, a small companion dog of the ancient Toltec civilization in what is now Mexico. The modern breed was named after the Mexican state of Chihuahua, where it was discovered in the mid-1800s.',
    physicalCharacteristics: 'Toy size, 2-6 lbs. Two coat varieties (smooth and long). Apple-domed head, large erect ears, expressive eyes. Many colors and patterns. Average lifespan 14-16 years (one of the longest-lived breeds).',
    temperament: 'Bold, alert, devoted, and often one-person dogs. Loving with their chosen human(s), suspicious of strangers. Brave to the point of foolishness — will challenge dogs many times their size.',
    exerciseNeeds: 'Low. Two 15-minute walks daily plus indoor play. Tiny legs cover little ground. Very sensitive to cold — sweaters needed below 50°F. Avoid hot pavement on tiny paws.',
    groomingRequirements: 'Low (smooth) to moderate (long). Smooths need weekly brushing. Long coats need 2-3x weekly brushing. Bathe monthly. Dental care is critical — small mouths develop disease quickly.',
    healthConsiderations: 'Patellar luxation, hydrocephalus, dental disease, hypoglycemia in puppies, heart conditions (especially mitral valve), and tracheal collapse. The molera (soft spot on the skull) is normal but requires care.',
    trainingTips: 'Smart and capable but often spoiled into naughtiness. House-training is challenging. Use small treats. Don\'t let small size excuse aggression — socialize early and require manners.',
    idealLivingConditions: 'Excellent apartment dogs and ideal for first-time small-dog owners (with patience). Best in adult households or with older respectful children. Sensitive to cold; indoor pets only.',
    sizeCategory: 'toy', energyLevel: 'moderate', groomingLevel: 'low', trainability: 'moderate',
    familyFriendly: true, goodWithKids: false, goodWithPets: false, isPopular: false,
  },
  {
    name: 'Cavalier King Charles Spaniel',
    description: 'Affectionate, gentle, and graceful. The Cavalier is the consummate lap dog — a small spaniel with the temperament of a perpetual companion and the soulful eyes to match.',
    origin: 'Descended from toy spaniels favored by European nobility from the 16th-18th centuries — particularly King Charles II of England, for whom the breed is named. Modern breed standard set in the 1920s.',
    physicalCharacteristics: 'Small, 13-18 lbs. Silky, moderately-long coat with feathering on ears, chest, legs, and tail. Four color varieties: Blenheim (chestnut/white), tricolor, ruby, and black-and-tan. Lifespan 12-14 years.',
    temperament: 'Gentle, affectionate, eager to please, and sociable with everyone. One of the most adaptable companion breeds — equally happy on a hike or a couch. Famously good with children, seniors, and other pets.',
    exerciseNeeds: 'Moderate. 30-60 minutes daily of walks plus indoor play. Adaptable — they\'ll match a sedentary owner or join a hiker. Don\'t over-exercise puppies; growth plates are sensitive.',
    groomingRequirements: 'Moderate. Brush 2-3 times weekly to prevent mats in feathering. Bathe monthly. Keep ear feathering clean and dry to prevent infections. Trim paw fur. No clipping required.',
    healthConsiderations: 'Mitral valve disease (very common — most Cavaliers develop it), syringomyelia (a serious neurological condition), hip dysplasia, and patellar luxation. Buy only from breeders doing cardiac and MRI testing.',
    trainingTips: 'Eager to please and quick to learn — among the easiest small breeds to train. Sensitive to harsh voices; positive methods only. House-training requires consistency. Great therapy and emotional-support dogs.',
    idealLivingConditions: 'Adaptable to apartment or home, urban or rural. Thrive on companionship — must not be left alone for long stretches. Excellent for first-time owners, seniors, and families.',
    sizeCategory: 'small', energyLevel: 'moderate', groomingLevel: 'moderate', trainability: 'easy',
    familyFriendly: true, goodWithKids: true, goodWithPets: true, isPopular: false,
  },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed curated breed profiles
    const breeds = breedData;
    for (const breed of breeds) {
      await prisma.breedProfile.upsert({
        where: { slug: createSlug(breed.name) },
        update: {},
        create: {
          breedName: breed.name,
          slug: createSlug(breed.name),
          description: breed.description,
          origin: breed.origin,
          physicalCharacteristics: breed.physicalCharacteristics,
          temperament: breed.temperament,
          exerciseNeeds: breed.exerciseNeeds,
          groomingRequirements: breed.groomingRequirements,
          healthConsiderations: breed.healthConsiderations,
          trainingTips: breed.trainingTips,
          idealLivingConditions: breed.idealLivingConditions,
          imageAlt: `${breed.name} dog breed`,
          sizeCategory: breed.sizeCategory,
          energyLevel: breed.energyLevel,
          groomingLevel: breed.groomingLevel,
          trainability: breed.trainability,
          familyFriendly: breed.familyFriendly ?? true,
          goodWithKids: breed.goodWithKids ?? true,
          goodWithPets: breed.goodWithPets ?? true,
          isPopular: breed.isPopular ?? false,
        },
      });
    }
    console.log(`✅ Seeded ${breeds.length} breed profiles`);

    // Seed expert articles
    const articles = [
      {
        title: "House Training Your Puppy: A Complete Guide",
        category: "training",
        content: `House training is one of the most important skills to teach your new puppy. This comprehensive guide will walk you through the process step-by-step, helping you establish good habits and avoid common mistakes.

**Week 1-2: Foundation Setting**
Start immediately when your puppy comes home. Take your puppy outside every 2-3 hours, immediately after meals, naps, and play sessions. Choose a specific spot in your yard and use a consistent command like "go potty."

**Week 3-4: Schedule Establishment**
Develop a routine. Puppies thrive on consistency. Feed at the same times daily, take outside at regular intervals, and reward success with praise and treats.

**Week 5-8: Reinforcement**
Continue the routine while gradually extending time between potty breaks. Watch for signs like sniffing, circling, or whining.

**Common Mistakes to Avoid:**
- Never punish accidents - clean thoroughly and redirect
- Don't give too much freedom too soon
- Avoid changing the schedule frequently

**Crate Training Integration:**
Use an appropriately sized crate as dogs won't soil their sleeping area. The crate should be just large enough for your puppy to stand and turn around.

**Troubleshooting:**
If accidents increase, return to more frequent potty breaks and closer supervision. Medical issues should be ruled out if progress stalls.

Success typically takes 4-6 months with consistency and patience. Remember, every puppy learns at their own pace.`,
        tags: ["puppy", "training", "house-training", "potty-training"],
      },
      {
        title: "Teaching Basic Commands: Sit, Stay, Come",
        category: "training",
        content: `Teaching basic commands forms the foundation of good dog behavior and strengthens your bond. These three essential commands can prevent dangerous situations and make daily life more enjoyable.

**Teaching "Sit"**
Start with treats at nose level. Slowly lift the treat over your dog's head - their bottom will naturally touch the ground. Say "sit" as this happens and immediately reward. Practice 5-10 times daily in short sessions.

**Progression Timeline:**
- Days 1-3: Use treat to guide position
- Days 4-7: Add verbal command before treat guidance  
- Week 2: Fade treat guidance, use only verbal command
- Week 3: Practice in different locations

**Teaching "Stay"**
Begin with your dog in the sit position. Hold your hand up in a "stop" gesture and take one step back. If they stay, immediately return and reward. Gradually increase distance and duration.

**Stay Training Steps:**
1. One step back, 2 seconds
2. Two steps back, 5 seconds
3. Across the room, 10 seconds
4. Out of sight briefly

**Teaching "Come"**
Start in a safe, enclosed area. Get on your dog's level, use an excited voice, and say "come" while backing away. Reward enthusiastically when they reach you.

**Safety Considerations:**
- Never call your dog to come for something they perceive as negative
- Practice recall in progressively more distracting environments
- Always reward coming when called, even if they were misbehaving

**Advanced Tips:**
Use high-value treats during training. Keep sessions short (5-10 minutes) to maintain focus. End on a positive note. Practice commands throughout daily routines.

Consistency from all family members is crucial. These commands can be mastered in 2-4 weeks with regular practice.`,
        tags: ["training", "commands", "obedience", "basic-training"],
      },
      {
        title: "Dealing with Destructive Behavior",
        category: "training",
        content: `Destructive behavior in dogs is often a symptom of underlying issues rather than deliberate misbehavior. Understanding the root causes helps address the problem effectively.

**Common Causes of Destruction:**
- Boredom and excess energy
- Separation anxiety
- Attention-seeking behavior
- Teething (in puppies)
- Medical issues or stress

**Identifying Triggers:**
Keep a destruction diary noting when, where, and what triggers the behavior. Look for patterns related to your schedule, weather, or household changes.

**Prevention Strategies:**

**Mental Stimulation:**
Provide puzzle toys, rotating toy selection, and training sessions. A tired mind is less likely to find destructive outlets.

**Physical Exercise:**
Ensure adequate daily exercise based on breed requirements. A 30-minute walk might suffice for some dogs while others need 2+ hours of activity.

**Environmental Management:**
- Remove tempting items
- Provide appropriate chew toys
- Create a safe, comfortable space
- Use deterrent sprays on furniture

**Addressing Separation Anxiety:**
Practice short departures, create positive associations with alone time, and consider calming supplements or professional help for severe cases.

**Redirection Techniques:**
When you catch destructive behavior, redirect to appropriate activities. Don't punish after the fact - dogs won't understand the connection.

**Training Solutions:**
Teach "leave it" and "drop it" commands. Reward good choices and appropriate chewing behavior.

**When to Seek Help:**
Contact a professional trainer if destruction occurs despite adequate exercise and enrichment, or if the behavior escalates or becomes dangerous.

Recovery typically takes 4-8 weeks of consistent management and training.`,
        tags: ["behavior", "destruction", "training", "problem-solving"],
      },
      {
        title: "Annual Vet Check-ups: What to Expect",
        category: "health",
        content: `Annual veterinary check-ups are essential for maintaining your dog's health and catching potential issues early. Understanding what happens during these visits helps you prepare and maximize their value.

**Pre-Visit Preparation:**
- Gather medical records and vaccination history
- Note any concerns or behavioral changes
- Bring a fresh stool sample if requested
- Prepare questions in advance

**Physical Examination Components:**

**Weight and Body Condition:**
Your vet will assess your dog's weight and body condition score, looking for signs of obesity or malnutrition.

**Vital Signs:**
Temperature, heart rate, and respiratory rate provide baseline health indicators.

**Head-to-Tail Assessment:**
- Eyes: clarity, discharge, pupil response
- Ears: cleanliness, odor, inflammation
- Mouth: dental health, gum color, bad breath
- Lymph nodes: swelling or abnormalities
- Heart and lungs: murmurs, irregular rhythms
- Abdomen: organ size, pain, masses
- Skin and coat: parasites, irritation, lumps
- Joints: mobility, pain, swelling

**Diagnostic Testing:**
Depending on age and risk factors, your vet may recommend:
- Blood work (complete blood count, chemistry panel)
- Urinalysis
- Fecal examination for parasites
- Heartworm testing

**Vaccination Updates:**
Core vaccines (rabies, DHPP) and lifestyle-appropriate vaccines (Lyme, kennel cough) will be reviewed and administered as needed.

**Preventive Care Discussion:**
- Parasite prevention (fleas, ticks, heartworms)
- Dental care recommendations
- Nutrition counseling
- Exercise and weight management

**Senior Dog Considerations:**
Dogs over 7 years may need more frequent check-ups and additional screening for age-related conditions.

**Cost-Saving Tips:**
Ask about wellness plans, generic medications, and preventive care packages.

Annual exams cost $200-400 but can prevent thousands in emergency treatment costs.`,
        tags: ["health", "veterinary", "check-up", "prevention"],
      },
      {
        title: "Recognizing Signs of Illness in Dogs",
        category: "health",
        content: `Early recognition of illness signs can make the difference between a minor health issue and a life-threatening emergency. Dogs instinctively hide illness, making observation skills crucial.

**Emergency Signs - Seek Immediate Care:**
- Difficulty breathing or blue gums
- Unconsciousness or collapse
- Severe bleeding
- Suspected poisoning
- Seizures
- Bloated, hard abdomen
- Repeated vomiting or dry heaving

**Urgent Signs - Call Vet Within Hours:**
- Persistent vomiting or diarrhea
- Loss of appetite for 24+ hours
- Lethargy or weakness
- Difficulty urinating or straining
- Eye injuries or sudden blindness
- Lameness or pain

**Monitor and Schedule Appointment:**
- Changes in eating or drinking habits
- Skin irritations or hot spots
- Mild coughing or sneezing
- Bad breath or dental issues
- Behavioral changes

**System-Specific Warning Signs:**

**Respiratory System:**
- Rapid breathing at rest
- Coughing, especially at night
- Wheezing or noisy breathing
- Exercise intolerance

**Digestive System:**
- Changes in stool consistency or color
- Excessive drooling
- Difficulty swallowing
- Abdominal pain signs (hunched posture)

**Musculoskeletal System:**
- Reluctance to jump or climb stairs
- Stiffness after rest
- Swelling in joints
- Changes in gait

**Neurological System:**
- Head tilting or circling
- Loss of coordination
- Changes in pupil size
- Behavioral changes or confusion

**Monitoring Techniques:**
- Check gums (should be pink, not pale or blue)
- Feel for normal temperature (101-102.5°F)
- Monitor eating, drinking, and elimination
- Note energy levels and interaction changes

**Documentation:**
Keep a health journal noting symptoms, duration, and potential triggers. Photos can help veterinarians assess skin conditions or swelling.

**Age Considerations:**
Puppies and senior dogs need closer monitoring as they're more susceptible to rapid health changes.

Trust your instincts - you know your dog best.`,
        tags: ["health", "symptoms", "illness", "emergency"],
      },
      {
        title: "Dental Care for Dogs: Prevention & Treatment",
        category: "health",
        content: `Dental disease affects 80% of dogs by age three, making oral hygiene crucial for overall health. Poor dental care can lead to pain, tooth loss, and systemic health problems.

**Understanding Dental Disease:**
Plaque buildup leads to tartar formation, gingivitis, and periodontal disease. Bacteria can enter the bloodstream, affecting heart, liver, and kidneys.

**Prevention Strategies:**

**Daily Brushing:**
Use dog-specific toothpaste (never human toothpaste). Start gradually:
- Day 1-3: Let dog taste toothpaste
- Day 4-7: Touch teeth with finger
- Week 2: Introduce toothbrush
- Week 3: Full brushing routine

**Dental Chews and Toys:**
VOHC-approved products help reduce plaque. Appropriate size prevents choking. Monitor for wear and replace regularly.

**Diet Considerations:**
Dental-specific diets have larger kibble size and texture that helps clean teeth. Raw bones (appropriate size) can help but carry risks.

**Professional Cleaning:**
Annual dental cleanings under anesthesia allow thorough examination and cleaning below the gum line.

**Warning Signs:**
- Bad breath (beyond normal "dog breath")
- Yellow or brown tartar buildup
- Red, swollen gums
- Difficulty eating or chewing
- Pawing at face or mouth
- Loose or missing teeth

**Treatment Options:**

**Professional Scaling:**
Removes tartar above and below gum line. Requires anesthesia for safety and thoroughness.

**Extractions:**
Severely damaged teeth may require removal to eliminate pain and infection.

**Advanced Treatments:**
Root canals and crowns are available at veterinary dental specialists for valuable teeth.

**Home Care Post-Treatment:**
Soft food diet initially, pain medication as prescribed, and graduated return to normal chewing.

**Special Considerations:**

**Senior Dogs:**
May need more frequent cleanings but anesthesia risk increases with age.

**Small Breeds:**
More prone to dental issues due to tooth crowding.

**Brachycephalic Breeds:**
Flat faces can complicate dental care and anesthesia.

**Cost Management:**
- Brush daily to extend time between cleanings
- Pet insurance may cover dental disease
- Ask about payment plans

Prevention costs less than treatment - daily brushing can save thousands in dental procedures.`,
        tags: ["dental", "health", "prevention", "oral-care"],
      },
      {
        title: "Choosing the Right Dog Food: A Nutritionist's Guide",
        category: "nutrition",
        content: `Selecting appropriate nutrition is one of the most important decisions for your dog's health. With countless options available, understanding key principles helps you make informed choices.

**Understanding AAFCO Standards:**
Look for foods meeting AAFCO (Association of American Feed Control Officials) nutritional standards. The statement should specify if it's for "growth," "maintenance," or "all life stages."

**Life Stage Considerations:**

**Puppy Food (Under 12 months):**
Higher protein and fat content supports rapid growth. Large breed puppies need specific formulations to prevent developmental orthopedic disease.

**Adult Maintenance (1-7 years):**
Balanced nutrition for active adult dogs. Protein content typically 18-25%.

**Senior Formulations (7+ years):**
May include joint support ingredients, adjusted protein levels, and enhanced digestibility.

**Key Ingredients to Understand:**

**Protein Sources:**
First ingredient should be a named meat or meat meal. "Meal" is concentrated protein - chicken meal contains more protein than fresh chicken due to water content.

**Carbohydrates:**
Provide energy and fiber. Quality sources include brown rice, sweet potatoes, and oats. Avoid excessive corn or wheat if your dog shows sensitivities.

**Fats:**
Essential for coat health and vitamin absorption. Look for named sources like chicken fat or salmon oil.

**Reading the Label:**

**Ingredient List:**
Listed by weight. First five ingredients matter most. Avoid foods with excessive by-products or unnamed meat sources.

**Guaranteed Analysis:**
Shows minimum protein and fat, maximum fiber and moisture. Don't rely solely on percentages - consider total calorie content.

**Feeding Guidelines:**
Starting point only. Adjust based on your dog's body condition, activity level, and individual needs.

**Special Dietary Needs:**

**Food Allergies:**
Limited ingredient diets help identify triggers. Novel protein sources include duck, venison, or fish.

**Grain-Free Considerations:**
Not necessary unless your dog has diagnosed grain allergies. Some grain-free foods have been linked to heart issues.

**Prescription Diets:**
Therapeutic foods for specific conditions should only be used under veterinary guidance.

**Quality Indicators:**
- AAFCO statement present
- Named protein sources
- No excessive fillers
- Manufactured in reputable facilities
- Feeding trials conducted

**Budget Considerations:**
Higher quality foods often provide better nutrition per dollar due to increased digestibility and nutrient density.

**Transition Guidelines:**
Change foods gradually over 7-10 days to avoid digestive upset:
- Days 1-3: 75% old food, 25% new
- Days 4-6: 50% each
- Days 7-10: 25% old, 75% new

Consult your veterinarian for personalized nutrition recommendations.`,
        tags: ["nutrition", "dog-food", "feeding", "diet"],
      },
      {
        title: "Raw vs. Commercial Diets: Pros and Cons",
        category: "nutrition",
        content: `The debate between raw and commercial dog foods continues among pet owners. Both options can provide adequate nutrition when properly implemented, but each has distinct advantages and challenges.

**Raw Diet Overview:**
Raw diets typically include raw meat, bones, organs, and vegetables. Proponents believe this mimics ancestral eating patterns and provides optimal nutrition.

**Raw Diet Potential Benefits:**
- Improved coat condition and skin health
- Better dental health through bone chewing
- Smaller, less odorous stools
- Increased energy and muscle tone
- Reduced allergies in some dogs

**Raw Diet Risks and Challenges:**
- Bacterial contamination (Salmonella, E. coli)
- Nutritional imbalances without proper formulation
- Choking or intestinal obstruction from bones
- Higher cost and time investment
- Food safety concerns for human family members

**Commercial Diet Advantages:**
- Nutritional completeness and balance
- Convenience and shelf stability
- Quality control and safety testing
- Cost-effectiveness
- Veterinary research backing
- AAFCO nutritional adequacy standards

**Commercial Diet Disadvantages:**
- Processing may reduce some nutrients
- Preservatives and additives
- Less individual customization
- Potential for recalls
- Some dogs prefer fresh food taste

**Scientific Evidence:**
Limited peer-reviewed research supports raw diet benefits. Most veterinary nutritionists recommend complete and balanced commercial diets due to consistent nutritional adequacy.

**Making Raw Diets Safer:**
If choosing raw feeding:
- Consult veterinary nutritionist for formulation
- Source meat from reputable suppliers
- Practice strict food safety hygiene
- Regular blood work monitoring
- Avoid in households with immunocompromised individuals

**Commercial Diet Selection:**
Choose foods that:
- Meet AAFCO standards
- Undergo feeding trials
- Come from reputable manufacturers
- Match your dog's life stage and health status

**Hybrid Approaches:**
Some owners combine high-quality commercial food with occasional raw components or home-cooked meals for variety.

**Special Considerations:**

**Puppies and Seniors:**
Require precise nutrition - commercial diets provide consistency crucial for growth and aging.

**Dogs with Health Conditions:**
Therapeutic diets are typically only available commercially.

**Multi-Pet Households:**
Commercial diets simplify feeding when pets have different nutritional needs.

**Economic Factors:**
Raw diets often cost 2-3 times more than premium commercial foods.

**Decision Framework:**
Consider your lifestyle, budget, dog's health status, and risk tolerance. Both approaches can work with proper implementation.

**Red Flags:**
Avoid raw diets if your dog has:
- Compromised immune system
- Cancer or other serious illness
- History of pancreatitis

The best diet is one that provides complete nutrition, maintains ideal body condition, and fits your lifestyle sustainably.`,
        tags: ["nutrition", "raw-diet", "commercial-food", "feeding"],
      },
      {
        title: "Managing Food Allergies in Dogs",
        category: "nutrition",
        content: `Food allergies affect approximately 10% of dogs and can cause significant discomfort. Understanding proper diagnosis and management helps dogs live comfortably with food sensitivities.

**Understanding Food Allergies vs. Intolerances:**

**True Food Allergies:**
Immune system response to specific proteins. Symptoms can be severe and immediate.

**Food Intolerances:**
Digestive system difficulty processing certain ingredients. Generally less severe but chronic.

**Common Symptoms:**
- Itchy skin, particularly face, ears, paws
- Chronic ear infections
- Gastrointestinal upset (vomiting, diarrhea)
- Hot spots or skin infections
- Excessive licking or scratching
- Hair loss from scratching

**Most Common Allergens:**
- Beef (most common)
- Chicken and chicken eggs
- Dairy products
- Wheat and other grains
- Soy
- Lamb
- Corn

**Diagnosis Process:**

**Elimination Diet Trial:**
Gold standard for diagnosis. Feed novel protein and carbohydrate for 8-12 weeks. No treats, flavored medications, or table scraps allowed.

**Novel Protein Sources:**
Proteins your dog has never eaten: duck, venison, rabbit, fish, or hydrolyzed protein diets.

**Hydrolyzed Protein Diets:**
Proteins broken down into small pieces that don't trigger immune response.

**Trial Requirements:**
- Strict adherence for minimum 8 weeks
- All family members must comply
- Document symptom changes
- Gradual reintroduction of suspected allergens

**Management Strategies:**

**Long-term Diet Selection:**
Once triggers are identified, avoid those ingredients permanently. Read labels carefully as ingredients can be listed under different names.

**Limited Ingredient Diets:**
Commercial foods with minimal ingredients reduce exposure to potential allergens.

**Home-Cooked Options:**
Allow complete control over ingredients but require veterinary nutritionist consultation for balance.

**Cross-Contamination Prevention:**
Manufacturing facilities may process multiple proteins. Look for "single protein" facilities.

**Secondary Infection Treatment:**
Allergic skin may develop bacterial or yeast infections requiring medical treatment alongside diet changes.

**Environmental Considerations:**
Some dogs have both food and environmental allergies. Address all allergen sources for best results.

**Practical Tips:**

**Label Reading:**
Ingredients must be listed by weight. Watch for terms like "natural flavors" which may contain allergens.

**Treat Selection:**
Use single-ingredient treats that match the elimination diet protein source.

**Medication Considerations:**
Flavored medications and supplements may contain allergens. Ask for unflavored alternatives.

**Family Education:**
Everyone in the household must understand the importance of dietary restriction compliance.

**Long-term Monitoring:**
Some dogs develop new allergies over time. Monitor for symptom recurrence even on successful diets.

**Success Indicators:**
- Reduced itching and scratching
- Clearer skin
- Fewer ear infections
- Normalized bowel movements
- Better overall comfort

**When to Seek Help:**
Consult your veterinarian if:
- Symptoms worsen during elimination trial
- No improvement after 12 weeks
- Severe reactions occur
- Multiple food allergies are suspected

Food allergy management requires patience and dedication but dramatically improves quality of life when successful.`,
        tags: ["allergies", "nutrition", "elimination-diet", "health"],
      },
      {
        title: "First 8 Weeks: Essential Puppy Care",
        category: "puppy-care",
        content: `The first eight weeks with a new puppy are crucial for establishing healthy routines and building a strong foundation for lifelong well-being. This comprehensive guide covers everything new puppy parents need to know.

**Before Puppy Arrives:**
- Puppy-proof your home
- Purchase essential supplies
- Choose a veterinarian
- Plan time off work for adjustment period

**Week 1-2: Adjustment Period**

**Immediate Needs:**
- Safe, comfortable sleeping area
- Frequent potty breaks (every 2-3 hours)
- Small, frequent meals (3-4 times daily)
- Gentle introduction to family members

**Sleep Schedule:**
Puppies sleep 18-20 hours daily. Don't worry if your puppy seems to sleep constantly - this is normal and necessary for development.

**Feeding Guidelines:**
Continue the breeder's or shelter's food initially. Feed puppy-specific food with higher protein and fat content. Measure portions carefully to prevent overfeeding.

**Week 3-4: Routine Development**

**Establishing Schedule:**
- Consistent meal times
- Regular potty break schedule
- Structured play and rest periods
- Beginning basic handling exercises

**Early Training:**
Start house training immediately. Begin teaching puppy their name. Introduce basic commands like "sit" using positive reinforcement.

**Socialization Beginnings:**
Expose puppy to household sounds, gentle handling, and family routines while maintaining safety.

**Week 5-6: Expanding Horizons**

**Increased Activity:**
Longer play sessions, introduction to toys, and basic leash training in safe areas.

**Health Monitoring:**
Watch for signs of illness, maintain vaccination schedule, and establish relationship with veterinarian.

**Basic Commands:**
Consistent training sessions for sit, come, and basic impulse control.

**Week 7-8: Building Confidence**

**Environmental Expansion:**
Safe exploration of different areas of the home, various surfaces and textures.

**Social Skills:**
Meeting new people (safely), exposure to different experiences within the home.

**Independence Training:**
Short periods alone in safe space, crate training progression.

**Essential Supplies Checklist:**
- Crate appropriately sized
- Food and water bowls
- High-quality puppy food
- Collar and leash
- ID tag with contact information
- Toys for chewing and play
- Bed or blankets
- Cleaning supplies for accidents

**Common Challenges and Solutions:**

**Crying at Night:**
Normal adjustment behavior. Provide comfort without creating dependencies. Crate training helps.

**Biting and Mouthing:**
Redirect to appropriate toys. Yelp when bitten to teach bite inhibition.

**House Training Accidents:**
Clean thoroughly with enzymatic cleaner. Increase supervision and frequency of potty breaks.

**Warning Signs:**
Contact veterinarian immediately for:
- Loss of appetite for 12+ hours
- Lethargy or weakness
- Vomiting or diarrhea
- Difficulty breathing
- Any concerning behavior changes

**Setting Up for Success:**
- Maintain consistent routines
- Use positive reinforcement training
- Provide plenty of rest
- Monitor health closely
- Be patient with the adjustment process

**Vaccination Schedule:**
Follow veterinarian recommendations for core vaccines. Avoid public areas until vaccination series is complete.

Remember: Every puppy adjusts at their own pace. What seems overwhelming initially becomes routine with consistency and patience.`,
        tags: ["puppy", "care", "training", "adjustment"],
      },
      {
        title: "Puppy Socialization: Critical Period Guide",
        category: "puppy-care",
        content: `The socialization period (3-14 weeks) is critical for raising a well-adjusted, confident dog. Proper socialization prevents fear-based behaviors and aggression while building positive associations with the world.

**Understanding Critical Periods:**

**Primary Socialization (3-5 weeks):**
Occurs with littermates and mother. Most puppies are still with breeders during this time.

**Secondary Socialization (6-14 weeks):**
Most important period for human-directed socialization. Peak learning time for accepting new experiences.

**Juvenile Period (3-6 months):**
Continued learning but with increasing caution toward new experiences.

**Socialization Goals:**
- Positive exposure to various people, animals, environments
- Building confidence in new situations
- Learning appropriate social behaviors
- Preventing fear-based responses

**Safe Socialization Before Full Vaccination:**

**Controlled Indoor Experiences:**
Invite healthy, vaccinated dogs to your home. Meet people of different ages, appearances, and voices.

**Carrying Expeditions:**
Carry puppy to observe (not interact with) public environments like parking lots, pet stores, busy areas.

**Puppy Classes:**
Properly supervised classes with vaccination requirements provide safe social opportunities.

**Car Rides:**
Regular car trips to various destinations, even if puppy stays in the vehicle.

**Socialization Checklist:**

**People Variations:**
- Men, women, children
- Different ethnicities and ages
- People wearing hats, uniforms, glasses
- People with mobility aids
- Loud and quiet personalities

**Environmental Sounds:**
- Household appliances
- Traffic noises
- Construction sounds
- Weather (rain, thunder)
- Music and television

**Surfaces and Textures:**
- Grass, concrete, gravel
- Stairs and ramps
- Slippery floors
- Metal grates
- Sand and dirt

**Handling Exercises:**
- Touching paws, ears, mouth
- Gentle restraint
- Grooming tools introduction
- Nail trimming preparation
- Medical examination simulation

**Positive Association Techniques:**

**Pairing Method:**
Present new experience + high-value treats simultaneously. This creates positive associations.

**Gradual Exposure:**
Start with mild versions of experiences. Gradually increase intensity as puppy shows comfort.

**Retreat Option:**
Always allow puppy to move away from overwhelming situations. Forcing interaction creates negative associations.

**Watch for Stress Signals:**
- Excessive panting or drooling
- Trembling or shaking
- Hiding or escape attempts
- Loss of appetite
- Excessive vocalization

**Post-Vaccination Socialization:**

**Dog Parks:**
Wait until fully vaccinated and puppy shows confidence. Start with less busy times.

**Public Spaces:**
Farmers markets, outdoor cafes, hardware stores (dog-friendly locations).

**Group Training Classes:**
Structured learning environment with professional guidance.

**Common Mistakes to Avoid:**
- Forcing interactions
- Overwhelming puppy with too much too fast
- Comforting fearful behavior (inadvertently reinforcing fear)
- Stopping socialization after puppy hood

**Problem Prevention:**

**Resource Guarding:**
Regularly handle food bowls, toys, and treats during meals and play.

**Separation Anxiety:**
Gradually increase alone time, create positive associations with departure.

**Reactivity:**
Ensure positive experiences with triggers like bicycles, skateboards, other dogs.

**Long-term Benefits:**
Properly socialized puppies become:
- More confident adult dogs
- Easier to handle for grooming and veterinary care
- Better family companions
- Less likely to develop behavioral problems

**Professional Help:**
Consider professional training if:
- Puppy shows extreme fearfulness
- Aggressive behaviors emerge
- You're unsure about safe socialization practices

**Continued Socialization:**
Socialization doesn't end at 14 weeks. Continue exposing your dog to new experiences throughout their life to maintain confidence and adaptability.

The investment in proper socialization pays dividends for 12-15 years of your dog's life.`,
        tags: ["puppy", "socialization", "training", "behavior"],
      },
      {
        title: "Puppy-Proofing Your Home",
        category: "puppy-care",
        content: `Puppy-proofing protects both your belongings and your puppy's safety. A thorough approach prevents accidents, poisoning, and destructive behaviors while creating a safe learning environment.

**General Principles:**
- Think like a curious puppy at floor level
- Remove or secure anything valuable or dangerous
- Provide appropriate alternatives for natural behaviors
- Create safe spaces for unsupervised time

**Kitchen Safety:**

**Immediate Hazards:**
- Secure cabinet doors with child locks
- Remove access to trash cans and recycling
- Store cleaning products in high cabinets
- Unplug appliances when not in use

**Food Dangers:**
Keep away from counters and tables:
- Chocolate, grapes, raisins
- Onions, garlic, xylitol (artificial sweetener)
- Coffee, alcohol, macadamia nuts
- Cooked bones that can splinter

**Living Room Puppy-Proofing:**

**Electrical Safety:**
- Cover or hide electrical cords
- Unplug electronics when away
- Secure entertainment center cords
- Install outlet covers

**Furniture Protection:**
- Remove or secure small decorative items
- Protect furniture legs with bitter apple spray
- Elevate remote controls and gaming controllers
- Secure books and magazines

**Choking Hazards:**
- Pick up coins, jewelry, hair ties
- Remove small children's toys
- Secure craft supplies and sewing items
- Store batteries safely

**Bedroom Safety:**

**Clothing and Accessories:**
- Keep shoes in closets or high shelves
- Secure jewelry, watches, hair accessories
- Remove access to laundry hampers
- Protect bedding and pillows

**Medications:**
- Store all medications in secure containers
- Include vitamins and supplements
- Pet medications must also be secured
- Never leave pill organizers accessible

**Bathroom Hazards:**

**Personal Care Items:**
- Secure toothpaste, soaps, shampoos
- Remove razors and small bathroom items
- Keep toilet lids closed
- Store cosmetics and perfumes

**Cleaning Products:**
- Lock cabinet doors
- Remove toilet bowl cleaners
- Secure air fresheners
- Store feminine hygiene products

**Garage and Basement:**

**Chemical Dangers:**
- Antifreeze (extremely toxic even in small amounts)
- Paint, solvents, pesticides
- Fertilizers and gardening chemicals
- Car fluids and lubricants

**Sharp Objects:**
- Secure tools in locked cabinets
- Store nails, screws, hardware safely
- Remove access to machinery
- Clear work areas of debris

**Yard and Garden:**

**Plant Hazards:**
Remove or fence off toxic plants:
- Azaleas, rhododendrons
- Lilies, daffodils, tulips
- Sago palms, oleander
- Mushrooms growing in yard

**Physical Dangers:**
- Secure pool areas with fencing
- Check fencing for escape routes
- Remove small objects like golf balls
- Store garden tools safely

**Creating Safe Zones:**

**Puppy-Proof Room:**
Designate one completely safe room for unsupervised time. Remove all hazards and provide:
- Comfortable bedding
- Fresh water
- Appropriate toys
- Easy-to-clean flooring

**Exercise Pen Setup:**
Portable confinement that can move around the house. Include:
- Comfortable surface
- Water bowl
- Chew toys
- View of family activities

**Positive Alternatives:**

**Appropriate Chewing:**
Provide variety of textures:
- Rubber Kong toys
- Rope toys
- Safe bones designed for puppies
- Frozen treats in puzzle toys

**Mental Stimulation:**
- Puzzle feeders
- Hide treats around safe areas
- Rotating toy selection
- Training sessions

**Emergency Preparedness:**

**Poison Control Information:**
- ASPCA Poison Control: (888) 426-4435
- Pet Poison Helpline: (855) 764-7661
- Local emergency veterinarian contact
- Hydrogen peroxide for induced vomiting (only if directed by poison control)

**First Aid Kit:**
- Gauze and medical tape
- Digital thermometer
- Saline solution for eye irrigation
- Emergency contact numbers

**Supervision Guidelines:**
- Never leave puppy unsupervised in non-puppy-proofed areas
- Gradually earn freedom as training progresses
- Maintain puppy-proofing until adult maturity
- Regular safety checks as puppy grows and reaches new heights

Remember: Prevention is always easier and safer than treatment. Invest time in thorough puppy-proofing to prevent emergencies and property damage.`,
        tags: ["puppy", "safety", "puppy-proofing", "prevention"],
      },
      {
        title: "Caring for Senior Dogs: Health & Comfort",
        category: "senior-care",
        content: `Senior dogs (typically 7+ years, varying by size) require specialized care to maintain quality of life as they age. Understanding age-related changes helps provide appropriate support and comfort.

**Recognizing Senior Status:**

**Age Guidelines:**
- Giant breeds: 5-6 years
- Large breeds: 6-7 years  
- Medium breeds: 7-8 years
- Small breeds: 8-10 years

**Physical Changes to Expect:**
- Decreased energy and activity
- Gray muzzle and coat changes
- Slower movement, stiffness
- Weight changes (gain or loss)
- Decreased hearing or vision
- Changes in sleep patterns

**Health Monitoring:**

**Increased Veterinary Care:**
Senior dogs benefit from twice-yearly check-ups to catch issues early.

**Common Health Conditions:**
- Arthritis and joint disease
- Heart disease
- Kidney disease
- Cognitive dysfunction
- Cancer
- Dental disease

**At-Home Health Monitoring:**
- Weekly weight checks
- Monitor eating and drinking changes
- Note mobility and comfort levels
- Watch for behavioral changes
- Track bathroom habits

**Comfort Modifications:**

**Mobility Support:**
- Orthopedic bedding for joint support
- Ramps or steps to furniture/cars
- Non-slip rugs on slippery floors
- Raised food and water bowls
- Support harnesses for walks

**Environmental Adjustments:**
- Maintain consistent temperature
- Provide easy access to outside areas
- Install night lights for vision issues
- Keep routines predictable
- Create quiet rest areas

**Nutrition for Seniors:**

**Diet Modifications:**
- Senior-specific formulations
- Reduced calories if less active
- Increased fiber for digestive health
- Joint support supplements
- Easy-to-digest proteins

**Weight Management:**
Maintain ideal body condition to reduce stress on joints and organs. Obesity significantly impacts senior dog health.

**Exercise Adaptations:**

**Low-Impact Activities:**
- Shorter, more frequent walks
- Swimming (excellent for arthritic dogs)
- Mental stimulation games
- Gentle stretching and massage

**Warning Signs During Exercise:**
- Excessive panting
- Reluctance to continue
- Limping or favoring limbs
- Seeking shade or rest frequently

**Mental Health and Cognitive Function:**

**Canine Cognitive Dysfunction:**
Similar to dementia in humans. Signs include:
- Disorientation and confusion
- Changes in sleep-wake cycles
- Increased anxiety or clinginess
- House training accidents
- Decreased interaction

**Mental Stimulation:**
Continue training and puzzle games to maintain cognitive function. "Use it or lose it" applies to brain function.

**Pain Management:**

**Recognizing Pain:**
- Reluctance to move or play
- Changes in posture
- Difficulty getting up or lying down
- Decreased appetite
- Increased sleeping
- Behavioral changes (irritability, withdrawal)

**Treatment Options:**
- Anti-inflammatory medications
- Joint supplements (glucosamine, chondroitin)
- Physical therapy
- Acupuncture
- Laser therapy
- Weight management

**Quality of Life Assessment:**

**Good Days vs. Bad Days:**
Keep a journal tracking mobility, appetite, interaction, and comfort levels. The ratio helps guide care decisions.

**HHHHHMM Quality of Life Scale:**
- Hurt (pain level)
- Hunger (appetite and eating)
- Hydration
- Hygiene (ability to stay clean)
- Happiness (response to family)
- Mobility
- More good days than bad

**Creating Positive Experiences:**
- Maintain favorite activities when possible
- Provide extra attention and comfort
- Adapt activities to current abilities
- Focus on quality time together

**End-of-Life Considerations:**

**Difficult Decisions:**
Work closely with veterinarian to assess when quality of life declines significantly.

**In-Home Care:**
Many services provide veterinary care and euthanasia services in the comfort of home.

**Grief Support:**
Losing a senior companion is difficult. Pet loss support groups and counseling can help.

**Maximizing Golden Years:**
With appropriate care, senior dogs can enjoy several comfortable, happy years. The key is adapting care to meet changing needs while maintaining quality of life.

Regular veterinary care, environmental modifications, and lots of love help senior dogs age gracefully.`,
        tags: ["senior", "aging", "health", "comfort"],
      },
      {
        title: "Adjusting Exercise for Aging Dogs",
        category: "senior-care",
        content: `As dogs age, their exercise needs and capabilities change significantly. Adapting physical activity helps maintain health, mobility, and quality of life while preventing injury and overexertion.

**Understanding Age-Related Changes:**

**Physical Capabilities:**
- Decreased muscle mass and strength
- Reduced cardiovascular fitness
- Joint stiffness and arthritis
- Slower recovery times
- Decreased heat tolerance
- Balance and coordination changes

**Exercise Benefits for Seniors:**
- Maintains muscle mass
- Supports joint mobility
- Improves mental stimulation
- Aids weight management
- Enhances quality of life
- Strengthens human-dog bond

**Assessing Current Fitness Level:**

**Veterinary Evaluation:**
Before starting any exercise program, have your senior dog evaluated for:
- Heart conditions
- Joint disease severity
- Overall health status
- Appropriate activity restrictions

**Baseline Assessment:**
- Current activity tolerance
- Existing mobility limitations
- Pain levels during movement
- Recovery time after exercise

**Exercise Modifications by Age:**

**Early Seniors (7-10 years):**
- Moderate reduction in intensity
- Shorter but more frequent sessions
- Introduction of low-impact activities
- Continued enjoyment of favorite activities

**Advanced Seniors (10+ years):**
- Significantly modified activities
- Focus on comfort and mobility maintenance
- Very short, gentle sessions
- Emphasis on mental stimulation

**Low-Impact Exercise Options:**

**Swimming:**
Excellent for dogs with arthritis. Water supports body weight while providing resistance training. Many areas offer canine swimming facilities.

**Leash Walking:**
- Shorter distances at slower pace
- Allow frequent sniffing and rest stops
- Choose softer surfaces (grass vs. concrete)
- Avoid extreme temperatures

**Physical Therapy:**
Professional canine rehabilitation can design specific exercise programs for individual needs.

**Exercise Guidelines:**

**Frequency:**
Multiple short sessions (10-15 minutes) rather than one long session.

**Intensity:**
Keep activity at a level where your dog can maintain conversation (not excessive panting).

**Duration:**
Start conservative and gradually increase based on tolerance.

**Environmental Considerations:**

**Weather Adaptations:**
- Exercise during cooler parts of the day
- Provide shade and water access
- Consider indoor alternatives during extreme weather
- Use protective gear for cold weather

**Surface Selection:**
- Avoid hot pavement
- Choose grass or dirt trails over concrete
- Provide good traction surfaces
- Avoid steep inclines or declines

**Warning Signs to Stop Exercise:**

**During Activity:**
- Excessive panting or drooling
- Weakness or stumbling
- Reluctance to continue
- Seeking shade or rest
- Disorientation

**After Activity:**
- Extended recovery time
- Increased stiffness
- Loss of appetite
- Behavioral changes
- Difficulty getting up

**Alternative Activities:**

**Mental Stimulation:**
- Puzzle feeders and treat-dispensing toys
- Short training sessions
- Scent work and nose games
- Gentle play with toys

**Indoor Exercises:**
- Stair climbing (if joints allow)
- Balance exercises on cushions
- Gentle stretching and massage
- Hide-and-seek games

**Strengthening Activities:**
- Sit-to-stand exercises
- Walking over ground poles
- Balance board work
- Controlled leash walking on different surfaces

**Recovery and Rest:**

**Post-Exercise Care:**
- Provide comfortable resting area
- Monitor for delayed soreness
- Gentle massage if tolerated
- Maintain hydration

**Sleep Requirements:**
Senior dogs need more sleep - up to 18-20 hours daily. Don't interrupt necessary rest.

**Professional Support:**

**Canine Rehabilitation:**
Certified canine rehabilitation therapists can design specific programs and provide treatments like:
- Underwater treadmill therapy
- Laser therapy
- Therapeutic ultrasound
- Massage and manual therapy

**Working with Your Veterinarian:**
Regular check-ins help adjust exercise programs as conditions change. Pain management may be necessary to maintain activity levels.

**Creating a Sustainable Routine:**

**Consistency:**
Regular, gentle activity is better than sporadic intense exercise.

**Flexibility:**
Adapt daily activities based on your dog's current comfort level.

**Positive Experience:**
Keep exercise enjoyable and pressure-free. If your dog doesn't want to walk, offer alternative gentle activities.

**Quality Over Quantity:**
Focus on maintaining mobility and comfort rather than performance or endurance.

Remember: Every senior dog is different. What works for one may not work for another. The goal is maintaining the highest quality of life possible through appropriate, comfortable movement.`,
        tags: ["senior", "exercise", "mobility", "aging"],
      },
      {
        title: "End-of-Life Care: Difficult Decisions",
        category: "senior-care",
        content: `Making end-of-life decisions for beloved dogs is one of the most difficult aspects of pet ownership. Understanding options, recognizing quality of life indicators, and preparing emotionally helps navigate this challenging time.

**Quality of Life Assessment:**

**HHHHHMM Scale:**
Veterinarians use this scale to assess:
- **Hurt:** Is pain adequately controlled?
- **Hunger:** Is your dog eating and enjoying food?
- **Hydration:** Is your dog drinking and well-hydrated?
- **Hygiene:** Can your dog stay clean and dry?
- **Happiness:** Does your dog show interest and joy?
- **Mobility:** Can your dog move around adequately?
- **More good days than bad:** Overall life balance

**Daily Quality Assessment:**
Keep a journal tracking:
- Appetite and water consumption
- Mobility and comfort levels
- Interaction with family
- Sleep patterns
- Bathroom habits
- Pain indicators

**When to Consider Euthanasia:**

**Medical Indicators:**
- Uncontrollable pain despite treatment
- Terminal illness with poor prognosis
- Inability to perform basic functions
- Loss of dignity and independence
- Frequent medical crises

**Behavioral Changes:**
- Complete loss of interest in surroundings
- Inability to recognize family members
- Severe anxiety or distress
- Loss of house training with distress
- Withdrawal from all activities

**Working with Your Veterinarian:**

**Honest Communication:**
Discuss your dog's condition openly. Veterinarians can provide objective assessments about:
- Disease progression
- Treatment options and limitations
- Expected quality of life
- Timeline considerations

**Second Opinions:**
For complex cases, seeking additional veterinary perspectives can provide clarity and peace of mind.

**End-of-Life Options:**

**Palliative Care:**
Focus on comfort and pain management without curative treatment:
- Pain medications
- Anti-nausea treatments
- Appetite stimulants
- Comfort measures

**Hospice Care:**
Specialized care for terminally ill pets focusing on comfort and quality time:
- In-home nursing care
- Pain and symptom management
- Family support and guidance
- End-of-life planning

**Humane Euthanasia:**
Peaceful ending of suffering through veterinary-administered medications:
- Quick and painless process
- Can be performed at home or clinic
- Allows for final moments with family
- Prevents prolonged suffering

**Making the Decision:**

**Timing Considerations:**
"Better a week too early than a day too late" - preventing suffering is a final act of love.

**Family Discussions:**
Include all family members, especially children, in age-appropriate conversations about the decision.

**Personal Values:**
Consider your dog's personality, preferences, and your relationship when making decisions.

**Practical Arrangements:**

**Location Choices:**
- **Veterinary clinic:** Professional setting with full support
- **Home euthanasia:** Familiar, comfortable environment
- **Outdoor locations:** Some services accommodate special places

**Final Preparations:**
- Favorite foods or treats
- Comfortable bedding
- Family members present
- Photographs or paw prints
- Favorite toys or blankets

**Aftercare Options:**
- **Cremation:** Individual or communal options
- **Burial:** Home burial where legal, or pet cemeteries
- **Memorial services:** Celebrating your dog's life

**Supporting Children:**

**Age-Appropriate Explanations:**
- Use honest, simple language
- Explain the concept of ending suffering
- Allow questions and emotional responses
- Provide reassurance about love and memories

**Involvement Options:**
- Saying goodbye before the procedure
- Creating memory books or art projects
- Choosing memorial items
- Participating in aftercare decisions

**Grief and Healing:**

**Normal Grief Responses:**
- Sadness, anger, guilt
- Physical symptoms (fatigue, appetite changes)
- Difficulty concentrating
- Questioning decisions made

**Healing Strategies:**
- Allow time to grieve
- Share memories with understanding friends
- Create memorial tributes
- Consider grief counseling
- Volunteer at animal shelters when ready

**Support Resources:**
- Pet loss support hotlines
- Online grief support groups
- Veterinary grief counselors
- Books and resources about pet loss

**When to Consider Another Pet:**
- Grief has been processed
- Household is emotionally ready
- Practical considerations addressed
- New pet won't be a "replacement"

**Honoring Your Dog's Memory:**

**Memorial Ideas:**
- Plant a tree or garden
- Create photo albums or scrapbooks
- Donate to animal charities
- Commission artwork or jewelry
- Write letters or poems

**Continuing Bonds:**
Maintaining connection through memories and rituals can be healing and meaningful.

**Final Thoughts:**
End-of-life decisions are deeply personal and difficult. Trust your instincts, seek professional guidance, and remember that choosing to end suffering is a final act of love and compassion.

The pain of losing a beloved companion is the price we pay for the joy they bring to our lives. Honor both the joy and the pain as part of the beautiful relationship you shared.`,
        tags: ["end-of-life", "euthanasia", "grief", "quality-of-life"],
      },
    ];

    // Insert articles into database
    for (const article of articles) {
      await prisma.article.upsert({
        where: { slug: createSlug(article.title) },
        update: {},
        create: {
          title: article.title,
          slug: createSlug(article.title),
          content: article.content,
          excerpt: article.content.substring(0, 200) + '...',
          category: article.category,
          readTime: estimateReadingTime(article.content),
          author: 'DogText Expert Team',
          tags: article.tags,
          isPublished: true,
          isFeatured: ['House Training Your Puppy: A Complete Guide', 'Caring for Senior Dogs: Health & Comfort', 'Choosing the Right Dog Food: A Nutritionist\'s Guide'].includes(article.title),
        },
      });
    }
    console.log(`✅ Seeded ${articles.length} articles`);

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
