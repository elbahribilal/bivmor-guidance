import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  try {
    // Clean slate - delete all data in reverse dependency order
    await db.competitionTag.deleteMany()
    await db.media.deleteMany()
    await db.competition.deleteMany()
    await db.tag.deleteMany()
    await db.school.deleteMany()
    await db.category.deleteMany()
    await db.level.deleteMany()
    await db.city.deleteMany()
    await db.region.deleteMany()
    await db.siteSetting.deleteMany()
    await db.notification.deleteMany()
    await db.news.deleteMany()

    // ============================================
    // 1. REGIONS
    // ============================================
    const regionsData = [
      { name: 'Tanger-Tétouan-Al Hoceïma', nameAr: 'طنجة-تطوان-الحسيمة', nameFr: 'Tanger-Tétouan-Al Hoceïma', slug: 'tanger-tetouan-al-hoceima', order: 1 },
      { name: 'Oriental', nameAr: 'الشرق', nameFr: 'Oriental', slug: 'oriental', order: 2 },
      { name: 'Fès-Meknès', nameAr: 'فاس-مكناس', nameFr: 'Fès-Meknès', slug: 'fes-meknes', order: 3 },
      { name: 'Rabat-Salé-Kénitra', nameAr: 'الرباط-سلا-القنيطرة', nameFr: 'Rabat-Salé-Kénitra', slug: 'rabat-sale-kenitra', order: 4 },
      { name: 'Béni Mellal-Khénifra', nameAr: 'بني ملال-خنيفرة', nameFr: 'Béni Mellal-Khénifra', slug: 'beni-mellal-khenifra', order: 5 },
      { name: 'Casablanca-Settat', nameAr: 'الدار البيضاء-سطات', nameFr: 'Casablanca-Settat', slug: 'casablanca-settat', order: 6 },
      { name: 'Marrakech-Safi', nameAr: 'مراكش-آسفي', nameFr: 'Marrakech-Safi', slug: 'marrakech-safi', order: 7 },
      { name: 'Drâa-Tafilalet', nameAr: 'درعة-تافيلالت', nameFr: 'Drâa-Tafilalet', slug: 'draa-tafilalet', order: 8 },
      { name: 'Souss-Massa', nameAr: 'سوس-ماسة', nameFr: 'Souss-Massa', slug: 'souss-massa', order: 9 },
      { name: 'Guelmim-Oued Noun', nameAr: 'كلميم-واد نون', nameFr: 'Guelmim-Oued Noun', slug: 'guelmim-oued-noun', order: 10 },
      { name: 'Laâyoune-Sakia El Hamra', nameAr: 'العيون- الساقية الحمراء', nameFr: 'Laâyoune-Sakia El Hamra', slug: 'laayoune-sakia-el-hamra', order: 11 },
      { name: 'Dakhla-Oued Ed-Dahab', nameAr: 'الداخلة-وادي الذهب', nameFr: 'Dakhla-Oued Ed-Dahab', slug: 'dakhla-oued-ed-dahab', order: 12 },
    ]
    const regions = await Promise.all(
      regionsData.map((r) => db.region.create({ data: r }))
    )
    const regionMap = Object.fromEntries(regions.map((r) => [r.slug, r.id]))

    // ============================================
    // 2. CITIES
    // ============================================
    const citiesData = [
      // Tanger-Tétouan-Al Hoceïma
      { name: 'Tanger', nameAr: 'طنجة', nameFr: 'Tanger', slug: 'tanger', regionId: regionMap['tanger-tetouan-al-hoceima'], order: 1 },
      { name: 'Tétouan', nameAr: 'تطوان', nameFr: 'Tétouan', slug: 'tetouan', regionId: regionMap['tanger-tetouan-al-hoceima'], order: 2 },
      { name: 'Al Hoceïma', nameAr: 'الحسيمة', nameFr: 'Al Hoceïma', slug: 'al-hoceima', regionId: regionMap['tanger-tetouan-al-hoceima'], order: 3 },
      // Oriental
      { name: 'Oujda', nameAr: 'وجدة', nameFr: 'Oujda', slug: 'oujda', regionId: regionMap['oriental'], order: 1 },
      { name: 'Nador', nameAr: 'الناظور', nameFr: 'Nador', slug: 'nador', regionId: regionMap['oriental'], order: 2 },
      // Fès-Meknès
      { name: 'Fès', nameAr: 'فاس', nameFr: 'Fès', slug: 'fes', regionId: regionMap['fes-meknes'], order: 1 },
      { name: 'Meknès', nameAr: 'مكناس', nameFr: 'Meknès', slug: 'meknes', regionId: regionMap['fes-meknes'], order: 2 },
      // Rabat-Salé-Kénitra
      { name: 'Rabat', nameAr: 'الرباط', nameFr: 'Rabat', slug: 'rabat', regionId: regionMap['rabat-sale-kenitra'], order: 1 },
      { name: 'Salé', nameAr: 'سلا', nameFr: 'Salé', slug: 'sale', regionId: regionMap['rabat-sale-kenitra'], order: 2 },
      { name: 'Kénitra', nameAr: 'القنيطرة', nameFr: 'Kénitra', slug: 'kenitra', regionId: regionMap['rabat-sale-kenitra'], order: 3 },
      { name: 'Témara', nameAr: 'تمارة', nameFr: 'Témara', slug: 'temara', regionId: regionMap['rabat-sale-kenitra'], order: 4 },
      // Béni Mellal-Khénifra
      { name: 'Béni Mellal', nameAr: 'بني ملال', nameFr: 'Béni Mellal', slug: 'beni-mellal', regionId: regionMap['beni-mellal-khenifra'], order: 1 },
      { name: 'Khénifra', nameAr: 'خنيفرة', nameFr: 'Khénifra', slug: 'khenifra', regionId: regionMap['beni-mellal-khenifra'], order: 2 },
      { name: 'Khouribga', nameAr: 'خريبكة', nameFr: 'Khouribga', slug: 'khouribga', regionId: regionMap['beni-mellal-khenifra'], order: 3 },
      // Casablanca-Settat
      { name: 'Casablanca', nameAr: 'الدار البيضاء', nameFr: 'Casablanca', slug: 'casablanca', regionId: regionMap['casablanca-settat'], order: 1 },
      { name: 'Settat', nameAr: 'سطات', nameFr: 'Settat', slug: 'settat', regionId: regionMap['casablanca-settat'], order: 2 },
      { name: 'Mohammedia', nameAr: 'المحمدية', nameFr: 'Mohammedia', slug: 'mohammedia', regionId: regionMap['casablanca-settat'], order: 3 },
      // Marrakech-Safi
      { name: 'Marrakech', nameAr: 'مراكش', nameFr: 'Marrakech', slug: 'marrakech', regionId: regionMap['marrakech-safi'], order: 1 },
      { name: 'Safi', nameAr: 'أسفي', nameFr: 'Safi', slug: 'safi', regionId: regionMap['marrakech-safi'], order: 2 },
      { name: 'El Jadida', nameAr: 'الجديدة', nameFr: 'El Jadida', slug: 'el-jadida', regionId: regionMap['casablanca-settat'], order: 4 },
      // Drâa-Tafilalet
      { name: 'Errachidia', nameAr: 'الرشيدية', nameFr: 'Errachidia', slug: 'errachidia', regionId: regionMap['draa-tafilalet'], order: 1 },
      { name: 'Ouarzazate', nameAr: 'ورزازات', nameFr: 'Ouarzazate', slug: 'ouarzazate', regionId: regionMap['draa-tafilalet'], order: 2 },
      // Souss-Massa
      { name: 'Agadir', nameAr: 'أكادير', nameFr: 'Agadir', slug: 'agadir', regionId: regionMap['souss-massa'], order: 1 },
      { name: 'Inezgane', nameAr: 'إنزكان', nameFr: 'Inezgane', slug: 'inezgane', regionId: regionMap['souss-massa'], order: 2 },
      // Guelmim-Oued Noun
      { name: 'Guelmim', nameAr: 'كلميم', nameFr: 'Guelmim', slug: 'guelmim', regionId: regionMap['guelmim-oued-noun'], order: 1 },
      // Laâyoune-Sakia El Hamra
      { name: 'Laâyoune', nameAr: 'العيون', nameFr: 'Laâyoune', slug: 'laayoune', regionId: regionMap['laayoune-sakia-el-hamra'], order: 1 },
      // Dakhla-Oued Ed-Dahab
      { name: 'Dakhla', nameAr: 'الداخلة', nameFr: 'Dakhla', slug: 'dakhla', regionId: regionMap['dakhla-oued-ed-dahab'], order: 1 },
      // Extra cities
      { name: 'Ifrane', nameAr: 'إفران', nameFr: 'Ifrane', slug: 'ifrane', regionId: regionMap['fes-meknes'], order: 3 },
      { name: 'Berrechid', nameAr: 'برشيد', nameFr: 'Berrechid', slug: 'berrechid', regionId: regionMap['casablanca-settat'], order: 5 },
    ]

    // Remove duplicate entries (by name+regionId unique constraint)
    const uniqueCitiesData = citiesData.filter((c, i, arr) =>
      arr.findIndex(x => x.name === c.name && x.regionId === c.regionId) === i
    )

    const cities = await Promise.all(
      uniqueCitiesData.map((c) => db.city.create({ data: c }))
    )
    const cityMap = Object.fromEntries(cities.map((c) => [c.slug, c.id]))

    // ============================================
    // 3. LEVELS
    // ============================================
    const levelsData = [
      { name: 'Bac', nameAr: 'باكالوريا', nameFr: 'Baccalauréat', slug: 'bac', order: 1 },
      { name: 'Bac+2', nameAr: 'باك+2', nameFr: 'Bac+2', slug: 'bac-2', order: 2 },
      { name: 'Bac+3', nameAr: 'باك+3', nameFr: 'Licence', slug: 'bac-3', order: 3 },
      { name: 'Bac+4', nameAr: 'باك+4', nameFr: 'Maîtrise', slug: 'bac-4', order: 4 },
      { name: 'Bac+5', nameAr: 'باك+5', nameFr: 'Master / Ingénieur', slug: 'bac-5', order: 5 },
      { name: 'Doctorat', nameAr: 'دكتوراه', nameFr: 'Doctorat', slug: 'doctorat', order: 6 },
      { name: 'Formation Professionnelle', nameAr: 'تكوين مهني', nameFr: 'Formation Professionnelle', slug: 'formation-professionnelle', order: 7 },
    ]
    const levels = await Promise.all(
      levelsData.map((l) => db.level.create({ data: l }))
    )
    const levelMap = Object.fromEntries(levels.map((l) => [l.slug, l.id]))

    // ============================================
    // 4. CATEGORIES
    // ============================================
    const categoriesData = [
      { name: 'مدارس الهندسة', slug: 'ecoles-ingenieur', nameFr: 'Écoles d\'Ingénieurs', icon: 'Cog', color: '#10B981', order: 1 },
      { name: 'الطب والصيدلة', slug: 'medecine-pharmacie', nameFr: 'Médecine et Pharmacie', icon: 'Heart', color: '#EF4444', order: 2 },
      { name: 'العلوم السياسية', slug: 'sciences-politiques', nameFr: 'Sciences Politiques', icon: 'Landmark', color: '#8B5CF6', order: 3 },
      { name: 'القانون', slug: 'droit', nameFr: 'Droit', icon: 'Scale', color: '#F59E0B', order: 4 },
      { name: 'التجارة والتدبير', slug: 'commerce-gestion', nameFr: 'Commerce et Gestion', icon: 'Briefcase', color: '#3B82F6', order: 5 },
      { name: 'التكوين المهني', slug: 'formation-professionnelle', nameFr: 'Formation Professionnelle', icon: 'Wrench', color: '#6366F1', order: 6 },
      { name: 'العلوم', slug: 'sciences', nameFr: 'Sciences', icon: 'Atom', color: '#14B8A6', order: 7 },
      { name: 'الآداب والعلوم الإنسانية', slug: 'lettres-sciences-humaines', nameFr: 'Lettres et Sciences Humaines', icon: 'BookOpen', color: '#EC4899', order: 8 },
      { name: 'التعليم العالي', slug: 'enseignement-superieur', nameFr: 'Enseignement Supérieur', icon: 'GraduationCap', color: '#0EA5E9', order: 9 },
      { name: 'المنح الدراسية', slug: 'bourses', nameFr: 'Bourses d\'Études', icon: 'Award', color: '#D946EF', order: 10 },
      { name: 'Concours Fonction Publique', slug: 'concours-fonction-publique', nameFr: 'Concours Fonction Publique', icon: 'Building', color: '#78716C', order: 11 },
      { name: 'Concours Militaire', slug: 'concours-militaire', nameFr: 'Concours Militaire', icon: 'Shield', color: '#854D0E', order: 12 },
    ]
    const categories = await Promise.all(
      categoriesData.map((c) => db.category.create({ data: c }))
    )
    const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]))

    // ============================================
    // 5. SCHOOLS
    // ============================================
    const schoolsData = [
      {
        name: 'EMI - École Mohammadia d\'Ingénieurs',
        slug: 'emi',
        shortDescription: 'أقدم وأعرق مدرسة للمهندسين في المغرب، تأسست سنة 1959 بالرباط',
        fullDescription: 'L\'École Mohammadia d\'Ingénieurs (EMI) est la plus ancienne école d\'ingénieurs du Maroc, fondée en 1959. Elle forme des ingénieurs d\'élite dans diverses spécialités : génie civil, génie électrique, génie mécanique, génie informatique, et génie des procédés.',
        website: 'https://emi.ac.ma',
        cityId: cityMap['rabat'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: true,
        address: 'Avenue Ibn Sina, Agdal, Rabat',
        email: 'contact@emi.ac.ma',
        phone: '+212 5 37 68 71 00',
      },
      {
        name: 'ENSEM - École Nationale Supérieure d\'Électricité et de Mécanique',
        slug: 'ensem',
        shortDescription: 'مدرسة عليا للكهرباء والميكانيك بالرباط',
        fullDescription: 'L\'ENSEM est une grande école d\'ingénieurs marocaine fondée en 1986, spécialisée dans la formation d\'ingénieurs dans les domaines de l\'électricité, de la mécanique et de l\'informatique industrielle.',
        website: 'https://ensem.ac.ma',
        cityId: cityMap['rabat'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: true,
        address: 'BP 8118, Oasis, Casablanca',
      },
      {
        name: 'ENSA Rabat',
        slug: 'ensa-rabat',
        shortDescription: 'المدرسة الوطنية للعلوم التطبيقية بالرباط',
        fullDescription: 'L\'École Nationale des Sciences Appliquées de Rabat forme des ingénieurs d\'application dans différentes spécialités technologiques.',
        website: 'https://ensa-rabat.ac.ma',
        cityId: cityMap['rabat'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: false,
      },
      {
        name: 'ENSA Casablanca',
        slug: 'ensa-casablanca',
        shortDescription: 'المدرسة الوطنية للعلوم التطبيقية بالدار البيضاء',
        fullDescription: 'L\'ENSA de Casablanca propose des formations d\'ingénieurs adaptées aux besoins du marché.',
        website: 'https://ensa-casablanca.ac.ma',
        cityId: cityMap['casablanca'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: false,
      },
      {
        name: 'ENSA Marrakech',
        slug: 'ensa-marrakech',
        shortDescription: 'المدرسة الوطنية للعلوم التطبيقية بمراكش',
        fullDescription: 'L\'ENSA de Marrakech offre des formations d\'ingénieurs de haute qualité dans plusieurs spécialités.',
        website: 'https://ensa-marrakech.ac.ma',
        cityId: cityMap['marrakech'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: false,
      },
      {
        name: 'ENSA Tanger',
        slug: 'ensa-tanger',
        shortDescription: 'المدرسة الوطنية للعلوم التطبيقية بطنجة',
        fullDescription: 'L\'ENSA de Tanger forme des ingénieurs dans les domaines technologiques les plus demandés.',
        website: 'https://ensa-tanger.ac.ma',
        cityId: cityMap['tanger'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: false,
      },
      {
        name: 'Faculté de Médecine et de Pharmacie de Rabat',
        slug: 'faculte-medecine-rabat',
        shortDescription: 'كلية الطب والصيدلة بالرباط',
        fullDescription: 'La Faculté de Médecine et de Pharmacie de Rabat est l\'une des plus prestigieuses facultés de médecine au Maroc, formant des médecins et pharmaciens de haut niveau.',
        website: 'https://medecine-rabat.ma',
        cityId: cityMap['rabat'],
        categoryId: categoryMap['medecine-pharmacie'],
        levelId: levelMap['doctorat'],
        type: 'PUBLIC',
        isFeatured: true,
        address: 'Avenue Mohammed Belarbi El Alaoui, Rabat',
      },
      {
        name: 'Faculté de Médecine et de Pharmacie de Casablanca',
        slug: 'faculte-medecine-casablanca',
        shortDescription: 'كلية الطب والصيدلة بالدار البيضاء',
        fullDescription: 'La Faculté de Médecine et de Pharmacie de Casablanca forme des professionnels de santé qualifiés.',
        website: 'https://medecine-casablanca.ma',
        cityId: cityMap['casablanca'],
        categoryId: categoryMap['medecine-pharmacie'],
        levelId: levelMap['doctorat'],
        type: 'PUBLIC',
        isFeatured: false,
      },
      {
        name: 'ENCG Casablanca',
        slug: 'encg-casablanca',
        shortDescription: 'المدرسة الوطنية للتجارة والتدبير بالدار البيضاء',
        fullDescription: 'L\'École Nationale de Commerce et de Gestion de Casablanca est un établissement d\'enseignement supérieur de référence dans le domaine du commerce et de la gestion.',
        website: 'https://encg-casablanca.ma',
        cityId: cityMap['casablanca'],
        categoryId: categoryMap['commerce-gestion'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: true,
      },
      {
        name: 'ENCG Rabat',
        slug: 'encg-rabat',
        shortDescription: 'المدرسة الوطنية للتجارة والتدبير بالرباط',
        fullDescription: 'L\'ENCG de Rabat propose des formations supérieures en commerce et gestion reconnues à l\'échelle nationale.',
        website: 'https://encg-rabat.ma',
        cityId: cityMap['rabat'],
        categoryId: categoryMap['commerce-gestion'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: false,
      },
      {
        name: 'INPT - Institut National des Postes et Télécommunications',
        slug: 'inpt',
        shortDescription: 'المعهد الوطني للبريد والاتصالات بالرباط',
        fullDescription: 'L\'INPT est une grande école marocaine spécialisée dans la formation d\'ingénieurs dans les domaines des télécommunications et des technologies de l\'information.',
        website: 'https://inpt.ac.ma',
        cityId: cityMap['rabat'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: true,
        address: 'Avenue Allal El Fassi, Madinat Al Irfane, Rabat',
      },
      {
        name: 'ISCAE - Institut Supérieur de Commerce et d\'Administration des Entreprises',
        slug: 'iscae',
        shortDescription: 'المعهد الأعلى للتجارة وإدارة المقاولات بالدار البيضاء',
        fullDescription: 'L\'ISCAE est une institution de référence au Maroc pour les formations en commerce, management et administration des entreprises. Elle délivre le diplôme de l\'ISCAE, très prisé sur le marché du travail.',
        website: 'https://iscae.ma',
        cityId: cityMap['casablanca'],
        categoryId: categoryMap['commerce-gestion'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: true,
      },
      {
        name: 'HEM - Hautes Études Manageriales',
        slug: 'hem',
        shortDescription: 'المدرسة العليا للإدارة بالدار البيضاء',
        fullDescription: 'HEM est une école de management privée de renom au Maroc, offrant des formations en management, finance, marketing et ressources humaines.',
        website: 'https://hem.ac.ma',
        cityId: cityMap['casablanca'],
        categoryId: categoryMap['commerce-gestion'],
        levelId: levelMap['bac-5'],
        type: 'PRIVATE',
        isFeatured: false,
      },
      {
        name: 'Faculté de Droit de Rabat',
        slug: 'faculte-droit-rabat',
        shortDescription: 'كلية الحقوق بالرباط',
        fullDescription: 'La Faculté de Droit de Rabat est l\'une des plus anciennes facultés de droit au Maroc, formant des juristes et avocats de haut niveau.',
        website: 'https://droit-rabat.ma',
        cityId: cityMap['rabat'],
        categoryId: categoryMap['droit'],
        levelId: levelMap['bac-4'],
        type: 'PUBLIC',
        isFeatured: false,
      },
      {
        name: 'OFPPT - Office de la Formation Professionnelle et de la Promotion du Travail',
        slug: 'ofppt',
        shortDescription: 'مكتب التكوين المهني وإنعاش الشغل',
        fullDescription: 'L\'OFPPT est le principal opérateur de formation professionnelle au Maroc, avec des centres répartis sur tout le territoire national. Il offre des formations qualifiantes et diplômantes dans divers métiers.',
        website: 'https://ofppt.ma',
        cityId: cityMap['casablanca'],
        categoryId: categoryMap['formation-professionnelle'],
        levelId: levelMap['formation-professionnelle'],
        type: 'PUBLIC',
        isFeatured: true,
      },
      {
        name: 'Académie Royale Militaire',
        slug: 'academie-royale-militaire',
        shortDescription: 'الأكاديمية الملكية العسكرية بمكناس',
        fullDescription: 'L\'Académie Royale Militaire de Meknès forme les officiers des Forces Armées Royales dans différentes spécialités militaires et académiques.',
        website: 'https://armee.ma',
        cityId: cityMap['meknes'],
        categoryId: categoryMap['concours-militaire'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: false,
      },
      {
        name: 'Faculté des Sciences de Rabat',
        slug: 'faculte-sciences-rabat',
        shortDescription: 'كلية العلوم بالرباط',
        fullDescription: 'La Faculté des Sciences de Rabat offre des formations en sciences fondamentales et appliquées : mathématiques, physique, chimie, biologie et sciences de la terre.',
        website: 'https://fsr.ac.ma',
        cityId: cityMap['rabat'],
        categoryId: categoryMap['sciences'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: false,
      },
      {
        name: 'ENA - École Nationale d\'Administration',
        slug: 'ena',
        shortDescription: 'المدرسة الوطنية للإدارة بالرباط',
        fullDescription: 'L\'ENA de Rabat forme les hauts fonctionnaires de l\'État marocain. Elle est l\'institution de référence pour la formation des cadres de l\'administration publique.',
        website: 'https://ena.ma',
        cityId: cityMap['rabat'],
        categoryId: categoryMap['sciences-politiques'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: true,
      },
      {
        name: 'UIR - Université Internationale de Rabat',
        slug: 'uir',
        shortDescription: 'الجامعة الدولية للرباط',
        fullDescription: 'L\'UIR est une université privée de premier plan au Maroc, offrant des programmes variés en ingénierie, management, architecture et sciences politiques.',
        website: 'https://uir.ac.ma',
        cityId: cityMap['rabat'],
        categoryId: categoryMap['enseignement-superieur'],
        levelId: levelMap['bac-5'],
        type: 'PRIVATE',
        isFeatured: false,
      },
      {
        name: 'ENCG Tanger',
        slug: 'encg-tanger',
        shortDescription: 'المدرسة الوطنية للتجارة والتدبير بطنجة',
        fullDescription: 'L\'ENCG de Tanger forme des cadres dans les domaines du commerce et de la gestion.',
        website: 'https://encg-tanger.ma',
        cityId: cityMap['tanger'],
        categoryId: categoryMap['commerce-gestion'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: false,
      },
      {
        name: 'ENCG Marrakech',
        slug: 'encg-marrakech',
        shortDescription: 'المدرسة الوطنية للتجارة والتدبير بمراكش',
        fullDescription: 'L\'ENCG de Marrakech propose des formations en gestion et commerce international.',
        website: 'https://encg-marrakech.ma',
        cityId: cityMap['marrakech'],
        categoryId: categoryMap['commerce-gestion'],
        levelId: levelMap['bac-5'],
        type: 'PUBLIC',
        isFeatured: false,
      },
    ]
    const schools = await Promise.all(
      schoolsData.map((s) => db.school.create({ data: s as Parameters<typeof db.school.create>[0]['data'] }))
    )
    const schoolMap = Object.fromEntries(schools.map((s) => [s.slug, s.id]))

    // ============================================
    // 6. TAGS
    // ============================================
    const tagsData = [
      { name: '2025', slug: '2025' },
      { name: 'ingénierie', slug: 'ingenierie' },
      { name: 'médecine', slug: 'medecine' },
      { name: 'commerce', slug: 'commerce' },
      { name: 'droit', slug: 'droit' },
      { name: 'militaire', slug: 'militaire' },
      { name: 'fonction publique', slug: 'fonction-publique' },
      { name: 'bourse', slug: 'bourse' },
      { name: 'master', slug: 'master' },
      { name: 'doctorat', slug: 'doctorat' },
      { name: 'formation', slug: 'formation' },
      { name: 'concours', slug: 'concours' },
      { name: 'informatique', slug: 'informatique' },
      { name: 'télécommunications', slug: 'telecommunications' },
      { name: 'gendarmerie', slug: 'gendarmerie' },
    ]
    const tags = await Promise.all(
      tagsData.map((t) => db.tag.create({ data: t }))
    )
    const tagMap = Object.fromEntries(tags.map((t) => [t.slug, t.id]))

    // ============================================
    // 7. COMPETITIONS
    // ============================================
    const now = new Date()
    const futureDate = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
    const pastDate = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()

    const competitionsData = [
      {
        title: 'Concours EMI 2025 - École Mohammadia d\'Ingénieurs',
        slug: 'concours-emi-2025',
        shortDescription: 'مباراة ولوج المدرسة المحمدية للمهندسين 2025 - الرباط',
        fullDescription: 'Concours d\'accès à l\'École Mohammadia d\'Ingénieurs pour l\'année universitaire 2025-2026. Le concours est ouvert aux titulaires du baccalauréat scientifique ou équivalent.',
        officialLink: 'https://emi.ac.ma/concours',
        registrationOpen: true,
        deadline: futureDate(45),
        startDate: futureDate(60),
        requirements: 'Baccalauréat scientifique (Sciences Mathématiques, Sciences Physiques, ou SVT) avec mention Assez Bien minimum',
        documents: 'Copie de la CIN, relevés de notes du baccalauréat, photos d\'identité, certificat de résidence',
        stages: 'Concours écrit (Mathématiques, Physique, Français) + Oral de motivation',
        cityId: cityMap['rabat'],
        schoolId: schoolMap['emi'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac'],
        isFeatured: true,
        isPinned: true,
        status: 'OPEN',
        type: 'ADMISSION',
      },
      {
        title: 'Concours ENSEM 2025',
        slug: 'concours-ensem-2025',
        shortDescription: 'مباراة ولوج المدرسة الوطنية العليا للكهرباء والميكانيك 2025',
        fullDescription: 'Concours d\'accès à l\'ENSEM pour les candidats titulaires du baccalauréat scientifique.',
        officialLink: 'https://ensem.ac.ma/concours',
        registrationOpen: true,
        deadline: futureDate(30),
        startDate: futureDate(50),
        requirements: 'Baccalauréat scientifique, mention Bien recommandée',
        documents: 'CIN, relevés de notes, photos, certificat de scolarité',
        stages: 'Écrit + Oral',
        cityId: cityMap['casablanca'],
        schoolId: schoolMap['ensem'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac'],
        isFeatured: true,
        isPinned: false,
        status: 'OPEN',
        type: 'ADMISSION',
      },
      {
        title: 'Concours INPT 2025',
        slug: 'concours-inpt-2025',
        shortDescription: 'مباراة المعهد الوطني للبريد والاتصالات 2025',
        fullDescription: 'Concours d\'accès à l\'INPT pour les bacheliers scientifiques. Formation d\'ingénieurs en télécommunications et informatique.',
        officialLink: 'https://inpt.ac.ma/concours',
        registrationOpen: true,
        deadline: futureDate(35),
        startDate: futureDate(55),
        requirements: 'Bac Sciences Mathématiques ou Sciences Physiques',
        documents: 'CIN, Bac, photos',
        stages: 'Concours écrit + Oral',
        cityId: cityMap['rabat'],
        schoolId: schoolMap['inpt'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac'],
        isFeatured: true,
        isPinned: false,
        status: 'OPEN',
        type: 'ADMISSION',
      },
      {
        title: 'Concours ISCAE 2025',
        slug: 'concours-iscae-2025',
        shortDescription: 'مباراة المعهد الأعلى للتجارة وإدارة المقاولات 2025',
        fullDescription: 'Concours d\'accès à l\'ISCAE, l\'une des meilleures écoles de commerce au Maroc.',
        officialLink: 'https://iscae.ma/concours',
        registrationOpen: true,
        deadline: futureDate(40),
        startDate: futureDate(55),
        requirements: 'Baccalauréat toutes séries avec mention',
        documents: 'CIN, Bac, lettres de motivation',
        stages: 'Test d\'aptitude + Entretien',
        cityId: cityMap['casablanca'],
        schoolId: schoolMap['iscae'],
        categoryId: categoryMap['commerce-gestion'],
        levelId: levelMap['bac'],
        isFeatured: true,
        isPinned: false,
        status: 'OPEN',
        type: 'ADMISSION',
      },
      {
        title: 'Concours Accès ENCG 2025',
        slug: 'concours-encg-2025',
        shortDescription: 'مباراة ولوج المدارس الوطنية للتجارة والتدبير 2025',
        fullDescription: 'Concours d\'accès aux ENCG du Maroc (Casablanca, Rabat, Tanger, Marrakech, etc.).',
        officialLink: 'https://encg.ma/concours',
        registrationOpen: true,
        deadline: futureDate(25),
        startDate: futureDate(40),
        requirements: 'Baccalauréat toutes séries',
        documents: 'CIN, Bac, photos',
        stages: 'Test écrit (culture générale, logique, français)',
        cityId: cityMap['casablanca'],
        schoolId: schoolMap['encg-casablanca'],
        categoryId: categoryMap['commerce-gestion'],
        levelId: levelMap['bac'],
        isFeatured: true,
        isPinned: false,
        status: 'OPEN',
        type: 'ADMISSION',
      },
      {
        title: 'Concours Accès ENSA 2025',
        slug: 'concours-ensa-2025',
        shortDescription: 'مباراة ولوج المدارس الوطنية للعلوم التطبيقية 2025',
        fullDescription: 'Concours d\'accès aux ENSA du Maroc pour les bacheliers scientifiques.',
        officialLink: 'https://ensa.ma/concours',
        registrationOpen: true,
        deadline: futureDate(20),
        startDate: futureDate(35),
        requirements: 'Baccalauréat scientifique',
        documents: 'CIN, Bac, photos d\'identité',
        stages: 'Concours écrit (Maths, Physique)',
        cityId: cityMap['rabat'],
        schoolId: schoolMap['ensa-rabat'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac'],
        isFeatured: true,
        isPinned: false,
        status: 'OPEN',
        type: 'ADMISSION',
      },
      {
        title: 'Concours Résidanat Médecine 2025',
        slug: 'concours-residanat-medecine-2025',
        shortDescription: 'مباراة الإقامة الطبية 2025',
        fullDescription: 'Concours du Résidanat en Médecine pour les docteurs en médecine souhaitant se spécialiser.',
        officialLink: 'https://medecine-rabat.ma/residanat',
        registrationOpen: true,
        deadline: futureDate(60),
        startDate: futureDate(75),
        requirements: 'Doctorat en Médecine',
        documents: 'Diplôme de docteur en médecine, CIN, CV',
        stages: 'Concours écrit + Oral de spécialité',
        cityId: cityMap['rabat'],
        schoolId: schoolMap['faculte-medecine-rabat'],
        categoryId: categoryMap['medecine-pharmacie'],
        levelId: levelMap['doctorat'],
        isFeatured: true,
        isPinned: true,
        status: 'OPEN',
        type: 'ACADEMIC',
      },
      {
        title: 'Concours Accès Faculté de Médecine 2025',
        slug: 'concours-acces-medecine-2025',
        shortDescription: 'مباراة ولوج كليات الطب والصيدلة 2025',
        fullDescription: 'Concours d\'accès aux facultés de médecine et de pharmacie du Maroc.',
        officialLink: 'https://medecine-rabat.ma/concours',
        registrationOpen: true,
        deadline: futureDate(15),
        startDate: futureDate(30),
        requirements: 'Baccalauréat scientifique avec mention Très Bien ou Bien',
        documents: 'CIN, Bac, photos, certificat médical',
        stages: 'Concours écrit (SVT, Physique, Chimie)',
        cityId: cityMap['rabat'],
        schoolId: schoolMap['faculte-medecine-rabat'],
        categoryId: categoryMap['medecine-pharmacie'],
        levelId: levelMap['bac'],
        isFeatured: false,
        isPinned: false,
        status: 'OPEN',
        type: 'ADMISSION',
      },
      {
        title: 'Concours Fonction Publique 2025',
        slug: 'concours-fonction-publique-2025',
        shortDescription: 'مباراة الوظيفة العمومية 2025',
        fullDescription: 'Concours de recrutement dans la fonction publique marocaine pour divers postes administratifs et techniques.',
        officialLink: 'https://fonction-publique.gov.ma',
        registrationOpen: true,
        deadline: futureDate(50),
        startDate: futureDate(65),
        requirements: 'Niveau Bac à Bac+5 selon le poste',
        documents: 'CIN, diplômes, certificat de résidence, casier judiciaire',
        stages: 'Concours écrit + Oral',
        cityId: cityMap['rabat'],
        schoolId: null,
        categoryId: categoryMap['concours-fonction-publique'],
        levelId: levelMap['bac-3'],
        isFeatured: true,
        isPinned: false,
        status: 'OPEN',
        type: 'RECRUITMENT',
      },
      {
        title: 'Concours Gendarmerie Royale 2025',
        slug: 'concours-gendarmerie-royale-2025',
        shortDescription: 'مباراة الدرك الملكي 2025',
        fullDescription: 'Concours de recrutement d\'officiers et sous-officiers dans la Gendarmerie Royale.',
        officialLink: 'https://gendarmerie.ma',
        registrationOpen: true,
        deadline: futureDate(55),
        startDate: futureDate(70),
        requirements: 'Baccalauréat minimum, critères physiques requis',
        documents: 'CIN, Bac, certificat médical, casier judiciaire, photos',
        stages: 'Épreuves physiques + Écrit + Enquête de moralité',
        cityId: cityMap['rabat'],
        schoolId: null,
        categoryId: categoryMap['concours-militaire'],
        levelId: levelMap['bac'],
        isFeatured: false,
        isPinned: false,
        status: 'OPEN',
        type: 'RECRUITMENT',
      },
      {
        title: 'Concours Forces Armées Royales 2025',
        slug: 'concours-far-2025',
        shortDescription: 'مباراة القوات المسلحة الملكية 2025',
        fullDescription: 'Concours de recrutement d\'officiers dans les Forces Armées Royales.',
        officialLink: 'https://far.ma',
        registrationOpen: true,
        deadline: futureDate(40),
        startDate: futureDate(55),
        requirements: 'Baccalauréat scientifique, critères physiques stricts',
        documents: 'CIN, Bac, certificat médical militaire',
        stages: 'Sélection physique + Écrit + Oral + Visite médicale',
        cityId: cityMap['meknes'],
        schoolId: schoolMap['academie-royale-militaire'],
        categoryId: categoryMap['concours-militaire'],
        levelId: levelMap['bac'],
        isFeatured: false,
        isPinned: false,
        status: 'OPEN',
        type: 'RECRUITMENT',
      },
      {
        title: 'Concours OFPPT 2025',
        slug: 'concours-ofppt-2025',
        shortDescription: 'مباراة مكتب التكوين المهني وإنعاش الشغل 2025',
        fullDescription: 'Concours de recrutement de formateurs et cadres au sein de l\'OFPPT.',
        officialLink: 'https://ofppt.ma/concours',
        registrationOpen: true,
        deadline: futureDate(30),
        startDate: futureDate(45),
        requirements: 'Bac+2 à Bac+5 selon les postes',
        documents: 'CIN, diplômes, CV, lettre de motivation',
        stages: 'Écrit + Oral professionnel',
        cityId: cityMap['casablanca'],
        schoolId: schoolMap['ofppt'],
        categoryId: categoryMap['formation-professionnelle'],
        levelId: levelMap['bac-2'],
        isFeatured: false,
        isPinned: false,
        status: 'OPEN',
        type: 'CONTINUING_EDUCATION',
      },
      {
        title: 'Concours ENA 2025',
        slug: 'concours-ena-2025',
        shortDescription: 'مباراة المدرسة الوطنية للإدارة 2025',
        fullDescription: 'Concours d\'accès à l\'École Nationale d\'Administration pour la formation des hauts fonctionnaires.',
        officialLink: 'https://ena.ma/concours',
        registrationOpen: true,
        deadline: futureDate(35),
        startDate: futureDate(50),
        requirements: 'Licence (Bac+3) minimum en droit, sciences politiques ou économie',
        documents: 'CIN, diplôme de licence, relevés de notes',
        stages: 'Concours écrit (droit constitutionnel, administration) + Oral',
        cityId: cityMap['rabat'],
        schoolId: schoolMap['ena'],
        categoryId: categoryMap['sciences-politiques'],
        levelId: levelMap['bac-3'],
        isFeatured: true,
        isPinned: false,
        status: 'OPEN',
        type: 'RECRUITMENT',
      },
      {
        title: 'Concours Accès Master 2025',
        slug: 'concours-master-2025',
        shortDescription: 'مباراة ولوج الماستر 2025 - الجامعات المغربية',
        fullDescription: 'Concours d\'accès aux programmes de Master dans les universités marocaines.',
        officialLink: 'https://universite.ma/master',
        registrationOpen: true,
        deadline: futureDate(25),
        startDate: futureDate(40),
        requirements: 'Licence (Bac+3) dans la spécialité concernée',
        documents: 'CIN, diplôme de licence, relevés de notes S1-S6',
        stages: 'Sélection sur dossier + Entretien',
        cityId: cityMap['rabat'],
        schoolId: null,
        categoryId: categoryMap['enseignement-superieur'],
        levelId: levelMap['bac-3'],
        isFeatured: false,
        isPinned: false,
        status: 'OPEN',
        type: 'ACADEMIC',
      },
      {
        title: 'Concours Bourse d\'Études 2025',
        slug: 'concours-bourse-etudes-2025',
        shortDescription: 'مباراة المنح الدراسية 2025',
        fullDescription: 'Concours pour l\'obtention de bourses d\'études à l\'étranger et au Maroc pour les étudiants méritants.',
        officialLink: 'https://bourses.ma',
        registrationOpen: true,
        deadline: futureDate(60),
        startDate: futureDate(75),
        requirements: 'Bac+2 minimum, excellence académique requise',
        documents: 'CIN, relevés de notes, lettres de recommandation, projet d\'études',
        stages: 'Sélection sur dossier + Entretien',
        cityId: cityMap['rabat'],
        schoolId: null,
        categoryId: categoryMap['bourses'],
        levelId: levelMap['bac-2'],
        isFeatured: true,
        isPinned: false,
        status: 'OPEN',
        type: 'SCHOLARSHIP',
      },
      {
        title: 'Concours EMI 2024 (Session fermée)',
        slug: 'concours-emi-2024',
        shortDescription: 'مباراة المدرسة المحمدية للمهندسين 2024 - الجلسة منتهية',
        fullDescription: 'Concours EMI 2024 - Les inscriptions sont clôturées.',
        officialLink: 'https://emi.ac.ma/concours2024',
        registrationOpen: false,
        deadline: pastDate(120),
        startDate: pastDate(100),
        endDate: pastDate(95),
        requirements: 'Baccalauréat scientifique',
        documents: 'CIN, Bac, photos',
        stages: 'Écrit + Oral',
        cityId: cityMap['rabat'],
        schoolId: schoolMap['emi'],
        categoryId: categoryMap['ecoles-ingenieur'],
        levelId: levelMap['bac'],
        isFeatured: false,
        isPinned: false,
        status: 'EXPIRED',
        type: 'ADMISSION',
      },
      {
        title: 'Concours ISCAE 2024 (Session fermée)',
        slug: 'concours-iscae-2024',
        shortDescription: 'مباراة المعهد الأعلى للتجارة 2024 - منتهية',
        fullDescription: 'Concours ISCAE 2024 - Session terminée.',
        officialLink: 'https://iscae.ma/concours2024',
        registrationOpen: false,
        deadline: pastDate(150),
        startDate: pastDate(130),
        endDate: pastDate(125),
        requirements: 'Baccalauréat avec mention',
        documents: 'CIN, Bac, lettres',
        stages: 'Test + Entretien',
        cityId: cityMap['casablanca'],
        schoolId: schoolMap['iscae'],
        categoryId: categoryMap['commerce-gestion'],
        levelId: levelMap['bac'],
        isFeatured: false,
        isPinned: false,
        status: 'EXPIRED',
        type: 'ADMISSION',
      },
      {
        title: 'Concours Fonction Publique 2024 (Session fermée)',
        slug: 'concours-fonction-publique-2024',
        shortDescription: 'مباراة الوظيفة العمومية 2024 - منتهية',
        fullDescription: 'Concours de la fonction publique 2024 - Session terminée.',
        officialLink: 'https://fonction-publique.gov.ma/2024',
        registrationOpen: false,
        deadline: pastDate(200),
        startDate: pastDate(180),
        endDate: pastDate(175),
        requirements: 'Bac à Bac+5',
        documents: 'CIN, diplômes',
        stages: 'Écrit + Oral',
        cityId: cityMap['rabat'],
        schoolId: null,
        categoryId: categoryMap['concours-fonction-publique'],
        levelId: levelMap['bac-3'],
        isFeatured: false,
        isPinned: false,
        status: 'EXPIRED',
        type: 'RECRUITMENT',
      },
      {
        title: 'Concours Accès Doctorat 2025',
        slug: 'concours-doctorat-2025',
        shortDescription: 'مباراة ولوج الدكتوراه 2025',
        fullDescription: 'Concours d\'accès aux programmes de doctorat dans les universités marocaines.',
        officialLink: 'https://universite.ma/doctorat',
        registrationOpen: true,
        deadline: futureDate(70),
        startDate: futureDate(90),
        requirements: 'Master (Bac+5) dans la spécialité, projet de recherche',
        documents: 'CIN, diplôme de Master, relevés, projet de recherche, lettres de recommandation',
        stages: 'Soutenance du projet de recherche devant un jury',
        cityId: cityMap['rabat'],
        schoolId: schoolMap['faculte-sciences-rabat'],
        categoryId: categoryMap['enseignement-superieur'],
        levelId: levelMap['bac-5'],
        isFeatured: false,
        isPinned: false,
        status: 'OPEN',
        type: 'ACADEMIC',
      },
      {
        title: 'Concours Professeur de l\'Enseignement Secondaire 2025',
        slug: 'concours-professeur-secondaire-2025',
        shortDescription: 'مباراة أساتذة التعليم الثانوي 2025',
        fullDescription: 'Concours de recrutement de professeurs de l\'enseignement secondaire collégial et qualifiant.',
        officialLink: 'https://education.gov.ma/concours',
        registrationOpen: true,
        deadline: futureDate(30),
        startDate: futureDate(45),
        requirements: 'Licence (Bac+3) minimum dans la spécialité enseignée',
        documents: 'CIN, diplôme, certificat de résidence',
        stages: 'Écrit dans la spécialité + Épreuve pédagogique',
        cityId: cityMap['rabat'],
        schoolId: null,
        categoryId: categoryMap['concours-fonction-publique'],
        levelId: levelMap['bac-3'],
        isFeatured: false,
        isPinned: false,
        status: 'OPEN',
        type: 'RECRUITMENT',
      },
      {
        title: 'Concours HEM 2025',
        slug: 'concours-hem-2025',
        shortDescription: 'مباراة المدرسة العليا للإدارة 2025',
        fullDescription: 'Concours d\'accès à HEM Business School pour les bacheliers de toutes séries.',
        officialLink: 'https://hem.ac.ma/concours',
        registrationOpen: true,
        deadline: futureDate(20),
        startDate: futureDate(35),
        requirements: 'Baccalauréat toutes séries',
        documents: 'CIN, Bac, photos, frais de dossier',
        stages: 'Test d\'aptitude + Entretien de motivation',
        cityId: cityMap['casablanca'],
        schoolId: schoolMap['hem'],
        categoryId: categoryMap['commerce-gestion'],
        levelId: levelMap['bac'],
        isFeatured: false,
        isPinned: false,
        status: 'OPEN',
        type: 'ADMISSION',
      },
      {
        title: 'Concours UIR 2025 - Bourses de mérite',
        slug: 'concours-uir-bourse-2025',
        shortDescription: 'مباراة الجامعة الدولية للرباط - منح الاستحقاق 2025',
        fullDescription: 'Concours pour l\'obtention de bourses de mérite à l\'Université Internationale de Rabat.',
        officialLink: 'https://uir.ac.ma/bourses',
        registrationOpen: true,
        deadline: futureDate(45),
        startDate: futureDate(60),
        requirements: 'Baccalauréat avec mention Très Bien',
        documents: 'CIN, Bac, dossier académique complet',
        stages: 'Dossier + Entretien',
        cityId: cityMap['rabat'],
        schoolId: schoolMap['uir'],
        categoryId: categoryMap['bourses'],
        levelId: levelMap['bac'],
        isFeatured: false,
        isPinned: false,
        status: 'OPEN',
        type: 'SCHOLARSHIP',
      },
    ]

    const competitions = []
    for (const comp of competitionsData) {
      const { schoolId, categoryId, levelId, cityId, ...rest } = comp
      const competition = await db.competition.create({
        data: {
          ...rest,
          cityId: cityId || undefined,
          schoolId: schoolId || undefined,
          categoryId: categoryId || undefined,
          levelId: levelId || undefined,
          deadline: comp.deadline ? new Date(comp.deadline) : null,
          startDate: comp.startDate ? new Date(comp.startDate) : null,
          endDate: comp.endDate ? new Date(comp.endDate) : null,
        },
      })
      competitions.push(competition)
    }
    const competitionMap = Object.fromEntries(competitions.map((c) => [c.slug, c.id]))

    // ============================================
    // 8. COMPETITION TAGS
    // ============================================
    const competitionTagsData: { competitionSlug: string; tagSlug: string }[] = [
      { competitionSlug: 'concours-emi-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-emi-2025', tagSlug: 'ingenierie' },
      { competitionSlug: 'concours-emi-2025', tagSlug: 'concours' },
      { competitionSlug: 'concours-ensem-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-ensem-2025', tagSlug: 'ingenierie' },
      { competitionSlug: 'concours-inpt-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-inpt-2025', tagSlug: 'ingenierie' },
      { competitionSlug: 'concours-inpt-2025', tagSlug: 'telecommunications' },
      { competitionSlug: 'concours-inpt-2025', tagSlug: 'informatique' },
      { competitionSlug: 'concours-iscae-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-iscae-2025', tagSlug: 'commerce' },
      { competitionSlug: 'concours-encg-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-encg-2025', tagSlug: 'commerce' },
      { competitionSlug: 'concours-ensa-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-ensa-2025', tagSlug: 'ingenierie' },
      { competitionSlug: 'concours-residanat-medecine-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-residanat-medecine-2025', tagSlug: 'medecine' },
      { competitionSlug: 'concours-residanat-medecine-2025', tagSlug: 'doctorat' },
      { competitionSlug: 'concours-acces-medecine-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-acces-medecine-2025', tagSlug: 'medecine' },
      { competitionSlug: 'concours-fonction-publique-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-fonction-publique-2025', tagSlug: 'fonction-publique' },
      { competitionSlug: 'concours-gendarmerie-royale-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-gendarmerie-royale-2025', tagSlug: 'militaire' },
      { competitionSlug: 'concours-gendarmerie-royale-2025', tagSlug: 'gendarmerie' },
      { competitionSlug: 'concours-far-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-far-2025', tagSlug: 'militaire' },
      { competitionSlug: 'concours-ofppt-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-ofppt-2025', tagSlug: 'formation' },
      { competitionSlug: 'concours-ena-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-ena-2025', tagSlug: 'fonction-publique' },
      { competitionSlug: 'concours-master-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-master-2025', tagSlug: 'master' },
      { competitionSlug: 'concours-bourse-etudes-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-bourse-etudes-2025', tagSlug: 'bourse' },
      { competitionSlug: 'concours-doctorat-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-doctorat-2025', tagSlug: 'doctorat' },
      { competitionSlug: 'concours-professeur-secondaire-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-professeur-secondaire-2025', tagSlug: 'fonction-publique' },
      { competitionSlug: 'concours-hem-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-hem-2025', tagSlug: 'commerce' },
      { competitionSlug: 'concours-uir-bourse-2025', tagSlug: '2025' },
      { competitionSlug: 'concours-uir-bourse-2025', tagSlug: 'bourse' },
      { competitionSlug: 'concours-emi-2024', tagSlug: 'ingenierie' },
      { competitionSlug: 'concours-emi-2024', tagSlug: 'concours' },
      { competitionSlug: 'concours-iscae-2024', tagSlug: 'commerce' },
      { competitionSlug: 'concours-fonction-publique-2024', tagSlug: 'fonction-publique' },
    ]

    await Promise.all(
      competitionTagsData.map((ct) =>
        db.competitionTag.create({
          data: {
            competitionId: competitionMap[ct.competitionSlug],
            tagId: tagMap[ct.tagSlug],
          },
        })
      )
    )

    // ============================================
    // 9. SITE SETTINGS
    // ============================================
    const settingsData = [
      { key: 'site_name', value: 'منصة المباريات المغربية', type: 'TEXT' as const },
      { key: 'site_description', value: 'المنصة الأولى في المغرب للمباريات والفرص التعليمية - Concours, Écoles et Bourses au Maroc', type: 'TEXT' as const },
      { key: 'hero_title', value: 'ابحث عن المباراة المناسبة لك', type: 'TEXT' as const },
      { key: 'hero_subtitle', value: 'جميع المباريات والمدارس والمنح الدراسية في المغرب في مكان واحد', type: 'TEXT' as const },
      { key: 'contact_email', value: 'contact@morocco-concours.ma', type: 'TEXT' as const },
      { key: 'items_per_page', value: '12', type: 'NUMBER' as const },
    ]
    await Promise.all(
      settingsData.map((s) => db.siteSetting.create({ data: s }))
    )

    // ============================================
    // NEWS / ANNOUNCEMENTS
    // ============================================
    const newsData = [
      {
        title: 'فتح باب التسجيل في مباريات مدارس الهندسة 2025',
        content: 'أعلنت وزارة التعليم العالي والبحث العلمي عن فتح باب التسجيل في مباريات الولوج إلى مدارس الهندسة للموسم الجامعي 2025-2026. تشمل المباريات مدارس EMI و ENSEM و ENSA و INPT وغيرها. يمكن للراغبين في الترشح التقديم عبر المواقع الإلكترونية الرسمية للمدارس المعنية قبل انتهاء الآجال المحدد.',
        excerpt: 'أعلنت وزارة التعليم العالي عن فتح باب التسجيل في مباريات الولوج إلى مدارس الهندسة للموسم الجامعي 2025-2026.',
        category: 'إعلان',
        isPublished: true,
        isPinned: true,
      },
      {
        title: 'آجل تقديم ملفات مباريات الطب ينتهي قريباً',
        content: 'تنبيه هام للطلبة الراغبين في الترشح لمباريات الطب والصيدلة: الآجل النهائي لتقديم الملفات يقترب بسرعة. يجب على المرشحين التأكد من استكمال جميع الوثائق المطلوبة وتقديمها قبل الموعد النهائي. يتضمن الملف شهادة البكالوريا بصورة رسمية، نسخة من علامات السنة الأخيرة، صور شخصية، وشهادة طبية. لا تقبل الملفات الناقصة أو المقدمة بعد الآجل.',
        excerpt: 'تنبيه للطلبة الراغبين في الترشح لمباريات الطب والصيدلة: الآجل النهائي لتقديم الملفات يقترب.',
        category: 'آجل',
        isPublished: true,
        isPinned: false,
      },
      {
        title: 'نتائج مباريات العلوم السياسية متاحة الآن',
        content: 'تم الإعلان عن نتائج مباريات الولوج إلى معهد العلوم السياسية بالرباط. يمكن للمترشحين الاطلاع على النتائج عبر الموقع الرسمي للمعهد باستخدام رقم التسجيل. تهانينا للناجحين! على المقبولين التوجه إلى مصلحة التسجيلات قبل الموعد المحدد لإتمام إجراءات التسجيل النهائي.',
        excerpt: 'تم الإعلان عن نتائج مباريات الولوج إلى معهد العلوم السياسية. يمكنكم الاطلاع على النتائج عبر الموقع الرسمي.',
        category: 'نتائج',
        isPublished: true,
        isPinned: false,
      },
      {
        title: 'نصائح مهمة للتحضير للمباريات الكتابية',
        content: 'اكتشف أفضل الاستراتيجيات والمصادر للتحضير الفعال للمباريات الكتابية والشفوية. من بين النصائح الأساسية: التخطيط المبكر ووضع جدول مراجعة منتظم، التركيز على الدروس الأساسية والمواد المطلوبة، حل الامتحانات السابقة للتعود على أسلوب الأسئلة، الاهتمام بالصحة النفسية والجسدية خلال فترة التحضير، والانضمام لمجموعات الدراسة التفاعلية.',
        excerpt: 'اكتشف أفضل الاستراتيجيات والمصادر للتحضير الفعال للمباريات الكتابية والشفوية.',
        category: 'نصيحة',
        isPublished: true,
        isPinned: false,
      },
      {
        title: 'إحداث مسارات جديدة في التكوين المهني',
        content: 'أعلن مكتب التكوين المهني وإنعاش الشغل OFPPT عن إحداث مسارات تكوينية جديدة في مجالات التقنية الرقمية والذكاء الاصطناعي والأمن السيبراني. تهدف هذه المسارات الجديدة إلى تلبية احتياجات سوق العمل المتزايدة في القطاعات الرقمية. التسجيل مفتوح الآن في المراكز المعتمدة عبر كامل التراب الوطني.',
        excerpt: 'أعلن مكتب التكوين المهني عن إحداث مسارات تكوينية جديدة في مجالات التقنية الرقمية والذكاء الاصطناعي.',
        category: 'إعلان',
        isPublished: true,
        isPinned: false,
      },
      {
        title: 'مباريات القانون: تغييرات في شروط الترشح',
        content: 'تم تحديث شروط الترشح لمباريات الولوج إلى كليات القانون للسنة الجامعية 2025-2026. من أبرز التغييرات: رفع المعدل المطلوب في البكالوريا، إضافة مقابلة شخصية لجميع المترشحين، وإمكانية التقديم إلكترونياً فقط. ينصح المترشحون بالاطلاع على الشروط الجديدة عبر الموقع الرسمي لوزارة العدل قبل تقديم ملفاتهم.',
        excerpt: 'تم تحديث شروط الترشح لمباريات الولوج إلى كليات القانون للسنة الجامعية 2025-2026.',
        category: 'إعلان',
        isPublished: true,
        isPinned: false,
      },
    ]
    await Promise.all(
      newsData.map((n) => db.news.create({ data: n }))
    )

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      counts: {
        regions: regions.length,
        cities: cities.length,
        levels: levels.length,
        categories: categories.length,
        schools: schools.length,
        tags: tags.length,
        competitions: competitions.length,
        competitionTags: competitionTagsData.length,
        settings: settingsData.length,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
