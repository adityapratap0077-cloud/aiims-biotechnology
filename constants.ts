import { Subject } from './types';

// Definition of the raw syllabus structure to be hydrated into the state
// Includes pre-populated High-Yield Notes for every topic.
export const INITIAL_SYLLABUS: Subject[] = [
  {
    id: 'bio-sci',
    name: '1. Biological Sciences & Biotechnology',
    chapters: [
      {
        id: 'mol-bio',
        name: 'A. Molecular Biology [HY]',
        topics: [
          { 
            id: 'mb-1', 
            name: 'DNA Structure: A, B, Z forms; topology', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. DNA Forms**
- **B-DNA**: Watson-Crick model, Right-handed, ~10 bp/turn, major & minor grooves distinct. Most common physiologic form.
- **A-DNA**: Right-handed, shorter/broader, ~11 bp/turn, found in dehydrated samples or dsRNA.
- **Z-DNA**: Left-handed, zig-zag backbone, formed in high salt or GC-rich regions (alternating purine-pyrimidine).

### **2. Topology & Supercoiling**
- **Linking Number (Lk)**: Lk = Twist (Tw) + Writhe (Wr). Invariant in closed circular DNA unless strands are broken.
- **Topoisomerases**:
  - **Type I**: Cuts 1 strand, changes Lk by 1, no ATP.
  - **Type II (Gyrase)**: Cuts 2 strands, changes Lk by 2, requires ATP. Essential for relieving tension during replication.
- **EtBr Intercalation**: Unwinds DNA, decreasing twist and increasing writhe (positive supercoiling).`
          },
          { 
            id: 'mb-2', 
            name: 'Replication: Prok vs Euk; enzymes; telomeres', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Key Enzymes**
- **Prokaryotes**: 
  - *DNA Pol III*: Main replicative enzyme (high processivity).
  - *DNA Pol I*: Removes primers (5'->3' exo) and fills gaps.
  - *Primase (DnaG)*: Synthesizes RNA primers.
- **Eukaryotes**:
  - *Pol Alpha*: Primase activity.
  - *Pol Delta/Epsilon*: Main elongation (lagging/leading).

### **2. Mechanism**
- **Semi-conservative**: Meselson-Stahl experiment.
- **Direction**: Always 5' -> 3'.
- **Okazaki Fragments**: Discontinuous synthesis on lagging strand, ligated by DNA Ligase (NAD+ in prok, ATP in euk).

### **3. Telomeres (End Replication Problem)**
- **Telomerase**: A reverse transcriptase (TERT) carrying its own RNA template (TERC). Adds TTAGGG repeats to 3' overhang to prevent chromosome shortening. High activity in stem cells/cancer.`
          },
          { 
            id: 'mb-3', 
            name: 'Transcription: Promoters, RNA Pols, Mechanisms', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Prokaryotic Transcription**
- **RNA Polymerase Holoenzyme**: Core (alpha2, beta, beta', omega) + **Sigma factor**.
- **Promoters**: -10 (Pribnow box) and -35 sequences recognized by Sigma.
- **Termination**: 
  - *Rho-dependent*: Rho protein pulls RNA off.
  - *Rho-independent*: Hairpin loop formation + Poly-U stretch.

### **2. Eukaryotic RNA Polymerases**
- **Pol I**: rRNA (except 5S).
- **Pol II**: mRNA, snRNA, miRNA. (Sensitive to alpha-amanitin).
- **Pol III**: tRNA, 5S rRNA.

### **3. Key Transcription Factors**
- **TATA Box**: ~ -25 upstream, recognized by TBP (TFIID).
- **CTD Tail**: C-terminal domain of Pol II, phosphorylated for initiation/elongation transition.`
          },
          { 
            id: 'mb-4', 
            name: 'Post-Transcriptional Modifications', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. 5' Capping**
- Addition of 7-methylguanosine via 5'-5' triphosphate link.
- **Function**: Protects from degradation, aids ribosome binding.

### **2. Poly-A Tail (3')**
- Added by Poly-A Polymerase (PAP) without template.
- Signal: AAUAAA. Increases stability and export efficiency.

### **3. Splicing**
- **Spliceosome**: Complex of snRNPs (U1, U2, U4, U5, U6).
- **Mechanism**:
  1. 2' OH of Branch point A attacks 5' splice site (Lariat formation).
  2. 3' OH of Exon 1 attacks 3' splice site.
- **Alternative Splicing**: Generates protein diversity from single gene.`
          },
          { 
            id: 'mb-5', 
            name: 'Translation: Genetic code, ribosome, mechanism', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Genetic Code**
- **Degenerate**: Multiple codons for one amino acid (Wobble hypothesis at 3rd base).
- **Universal**: Mostly (exceptions in mitochondria).
- **Start**: AUG (Met/fMet). **Stop**: UAA, UAG, UGA.

### **2. Ribosomes**
- **Prokaryote (70S)**: 50S (23S rRNA - ribozyme) + 30S (16S rRNA - binds Shine-Dalgarno).
- **Eukaryote (80S)**: 60S + 40S.

### **3. Steps**
- **Initiation**: IFs bring tRNA-fMet to P-site.
- **Elongation**: A-site (Entry) -> P-site (Peptide bond) -> E-site (Exit). Powered by GTP.
- **Termination**: Release factors recognize stop codons (molecular mimicry of tRNA).`
          },
          { 
            id: 'mb-6', 
            name: 'Gene Regulation: Lac/Trp/Ara operons', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Lac Operon (Inducible)**
- **Negative Control**: LacI Repressor binds operator. Removed by Allolactose (inducer).
- **Positive Control**: cAMP-CAP complex binds upstream when Glucose is low.
- **Logic**: ON only if Lactose is PRESENT and Glucose is ABSENT.

### **2. Trp Operon (Repressible)**
- **Repression**: Trp acts as corepressor, binding TrpR to block transcription.
- **Attenuation**: Leader sequence peptide. High Trp -> Terminator hairpin (3-4). Low Trp -> Anti-terminator hairpin (2-3) allows RNA Pol to continue.

### **3. Ara Operon**
- **AraC Protein**: Acts as both repressor (no arabinose) and activator (with arabinose). DNA looping mechanism.`
          },
          { 
            id: 'mb-7', 
            name: 'DNA Repair: BER, NER, MMR, SOS', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Base Excision Repair (BER)**
- Fixes: Small lesions (e.g., Deamination of C -> U).
- Enzyme: **DNA Glycosylase** creates AP site -> AP Endonuclease cuts backbone.

### **2. Nucleotide Excision Repair (NER)**
- Fixes: Bulky lesions (e.g., Thymine dimers from UV).
- Enzyme: **UvrABC endonuclease** (Prok). Defect causes *Xeroderma Pigmentosum*.

### **3. Mismatch Repair (MMR)**
- Fixes: Replication errors.
- Proteins: **MutS/MutL**. Distinguishes strands by Methylation (Prok - hemimethylated GATC) or Nicks (Euk). Defect causes Lynch Syndrome.

### **4. Double Strand Break**
- **NHEJ**: Error-prone, simply ligates ends (Ku70/80).
- **Homologous Recombination**: Error-free, uses sister chromatid.`
          },
          { 
            id: 'mb-8', 
            name: 'RNA Interference: siRNA and miRNA', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Mechanism**
- **Dicer**: RNase III enzyme that cleaves dsRNA into short fragments (~21 nt).
- **RISC Complex**: RNA-induced Silencing Complex (contains Argonaute). Uses single strand guide to find target mRNA.

### **2. Comparison**
- **siRNA**: Exogenous origin (virus/lab), perfect match to target, leads to mRNA cleavage/degradation.
- **miRNA**: Endogenous (genome), imperfect match, leads to translational repression (P-bodies).`
          },
        ]
      },
      {
        id: 'biochem',
        name: 'B. Biochemistry [HY]',
        topics: [
          { 
            id: 'bc-1', 
            name: 'Amino acids: Structure, pI calculations', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Classification**
- **Non-polar**: Gly, Ala, Val, Leu, Ile, Met, Pro, Phe, Trp.
- **Polar**: Ser, Thr, Cys, Tyr, Asn, Gln.
- **Acidic**: Asp, Glu (Negatively charged at pH 7).
- **Basic**: Lys, Arg, His (Positively charged at pH 7). *His acts as buffer at physiologic pH.*

### **2. Special Properties**
- **Proline**: Imino acid, helix breaker.
- **Glycine**: Achiral, smallest.
- **Cysteine**: Forms disulfide bonds.
- **Absorbance (280nm)**: Trp > Tyr > Phe.

### **3. pI Calculation**
- Zwitterion: Net charge 0.
- **Formula**: Average of the two pKa values surrounding the neutral species.
- Example (Acidic AA): (pKa1_COOH + pKaR) / 2.`
          },
          { 
            id: 'bc-2', 
            name: 'Protein folding: Primary-Quaternary, Ramachandran', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Levels of Structure**
- **Primary**: Peptide bonds (resonance, planar). Sequence determines fold (Anfinsen).
- **Secondary**: Alpha-helix (H-bonds n to n+4) & Beta-sheets. Stabilized by main-chain H-bonds.
- **Tertiary**: 3D shape. Hydrophobic effect (entropy driven) is main force.
- **Quaternary**: Multiple subunits (e.g., Hemoglobin).

### **2. Ramachandran Plot**
- Plots Phi (N-Calpha) vs Psi (Calpha-C) angles.
- **Top Left**: Beta-sheets.
- **Bottom Left**: Right-handed Alpha-helix.
- **Top Right**: Left-handed Alpha-helix / Glycine.
- Allowed regions determined by steric hindrance.`
          },
          { 
            id: 'bc-3', 
            name: 'Enzymology: Kinetics, Inhibition, Lineweaver-Burk', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Michaelis-Menten**
- **Km**: Substrate conc at 1/2 Vmax. Inverse measure of affinity.
- **kcat**: Turnover number.
- **Efficiency**: kcat/Km.

### **2. Inhibition (Lineweaver-Burk Plot)**
- **Competitive**: Binds active site. *Vmax same, Km increases* (Crosses Y-axis at same point).
- **Non-Competitive**: Binds allosteric site. *Vmax decreases, Km same* (Crosses X-axis at same point).
- **Uncompetitive**: Binds ES complex only. *Both Vmax and Km decrease* (Parallel lines).

### **3. Regulation**
- **Allosteric**: Sigmoidal curve (cooperativity, e.g., Hb).
- **Covalent**: Phosphorylation.`
          },
          { 
            id: 'bc-4', 
            name: 'Metabolism: Glycolysis, TCA, Urea, PPP', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Glycolysis (Cytosol)**
- **Rate Limiting**: PFK-1.
- **Yield**: 2 ATP, 2 NADH, 2 Pyruvate.
- **Fate**: Aerobic -> Acetyl CoA; Anaerobic -> Lactate/Ethanol.

### **2. TCA Cycle (Mitochondria Matrix)**
- **Entry**: Acetyl-CoA + Oxaloacetate -> Citrate.
- **Yield/turn**: 3 NADH, 1 FADH2, 1 GTP.
- **Rate Limiting**: Isocitrate Dehydrogenase.

### **3. Urea Cycle**
- Removes Nitrogen. Occurs in Liver (Mito + Cyto).
- Key Enzyme: **CPS-I**.
- Links to TCA via Fumarate.

### **4. Pentose Phosphate Pathway**
- Generates **NADPH** (biosynthesis/antioxidant) and **Ribose-5-P** (nucleotides).
- Rate Limiting: G6PD.`
          },
          { 
            id: 'bc-5', 
            name: 'Bioenergetics: ETC, OxPhos, ATP Synthase', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Electron Transport Chain**
- **Complex I**: NADH dehydrogenase (pumps 4 H+).
- **Complex II**: Succinate dehydrogenase (FADH2 entry, no pumping).
- **Complex III**: Cyt c reductase (pumps 4 H+).
- **Complex IV**: Cyt c oxidase (pumps 2 H+, reduces O2 to H2O).

### **2. Oxidative Phosphorylation**
- **Chemiosmotic Theory**: Proton gradient (PMF) drives ATP synthesis.
- **Complex V (ATP Synthase)**: F0 (pore) + F1 (catalytic head). Rotational catalysis.

### **3. Inhibitors**
- **Rotenone**: Complex I.
- **Cyanide/CO**: Complex IV.
- **Oligomycin**: Blocks ATP Synthase F0.
- **Uncouplers (DNP)**: Destroy proton gradient (Heat gen).`
          },
          { 
            id: 'bc-6', 
            name: 'Lipid & Nucleotide Metabolism', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Fatty Acid Oxidation (Beta-Ox)**
- Location: Mitochondrial Matrix.
- Transport: **Carnitine Shuttle** (Rate limiting: CAT-1).
- Products: Acetyl-CoA, NADH, FADH2.

### **2. Fatty Acid Synthesis**
- Location: Cytosol.
- Key Enzyme: **Acetyl-CoA Carboxylase (ACC)** (requires Biotin).
- Donor: Malonyl-CoA.

### **3. Nucleotides**
- **Purine Synthesis**: Built on Ribose-P. Precursors: Gly, Asp, Gln, THF. Limit: PRPP Synthetase.
- **Salvage Pathway**: HGPRT enzyme (Defect: Lesch-Nyhan).`
          },
        ]
      },
      {
        id: 'cell-gen',
        name: 'C. Cell Biology & Genetics',
        topics: [
          { 
            id: 'cg-1', 
            name: 'Membrane Biology & Transport', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Fluid Mosaic Model**
- Lipids (Lateral diffusion fast, Flip-flop slow/rare).
- Cholesterol: Buffers fluidity (prevents stiff packing at low temp, reduces fluidity at high temp).

### **2. Transport**
- **Passive**: Simple diffusion (gases) or Facilitated (Channels/Carriers). No ATP.
- **Active (Primary)**: Uses ATP directly (e.g., **Na+/K+ ATPase**: 3 Na+ OUT, 2 K+ IN).
- **Active (Secondary)**: Uses gradient (e.g., SGLT1 uses Na+ gradient to pull Glucose).`
          },
          { 
            id: 'cg-2', 
            name: 'Cell Signaling: GPCR, RTK, 2nd Messengers', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. GPCR (G-Protein Coupled Receptors)**
- 7 Transmembrane domains.
- **Gs**: Activates Adenylyl Cyclase -> cAMP -> PKA.
- **Gq**: Activates PLC -> IP3 (Ca2+ release) + DAG (PKC activation).
- **Gi**: Inhibits Adenylyl Cyclase.

### **2. RTK (Receptor Tyrosine Kinase)**
- Dimerizes upon ligand binding -> Autophosphorylation.
- Activates **Ras-MAPK pathway** (Growth/Proliferation).

### **3. Second Messengers**
- cAMP, cGMP, Ca2+, IP3, DAG, NO.`
          },
          { 
            id: 'cg-3', 
            name: 'Cell Cycle: Checkpoints, Cyclins/CDKs', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Phases**
- **G1**: Growth. *Restriction Point*.
- **S**: DNA Replication.
- **G2**: Prep for mitosis.
- **M**: Mitosis.

### **2. Regulation**
- **Cyclins**: Levels oscillate. **CDKs**: Levels constant, activity depends on cyclin.
- **G1/S**: Cyclin D/CDK4/6 -> Phosphorylates **Rb** -> Releases **E2F** -> Transcription of S-phase genes.
- **MPF (Maturation Promoting Factor)**: Cyclin B + CDK1. Drives G2 -> M.

### **3. Checkpoints**
- **p53**: "Guardian of genome". DNA damage -> p53 -> p21 (CDK inhibitor) -> Cell cycle arrest.`
          },
          { 
            id: 'cg-4', 
            name: 'Cell Death: Apoptosis vs Necrosis', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Apoptosis (Programmed)**
- **Morphology**: Shrinkage, chromatin condensation, blebbing, apoptotic bodies.
- **No Inflammation**.
- **Mechanism**:
  - *Intrinsic*: Mitochondria releases Cyt c -> Caspase 9. (Regulated by Bcl-2 family: Bax=Pro, Bcl2=Anti).
  - *Extrinsic*: Death receptor (FasL) -> Caspase 8.
  - *Executioner*: Caspase 3.

### **2. Necrosis**
- Accidental cell death (trauma/ischemia).
- Swelling, rupture, **Inflammation**.`
          },
          { 
            id: 'cg-5', 
            name: 'Mendelian Genetics, Pedigree, Epistasis', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Laws**
- **Segregation**: Alleles separate during gamete formation.
- **Independent Assortment**: Genes on different chromosomes segregate independently (9:3:3:1 ratio).

### **2. Gene Interactions (Epistasis)**
- **Recessive Epistasis**: 9:3:4 (e.g., Coat color).
- **Dominant Epistasis**: 12:3:1.
- **Complementary**: 9:7.

### **3. Pedigree Analysis**
- **Auto Dom**: Every generation, M=F.
- **Auto Rec**: Skips generation, consanguinity increases risk.
- **X-linked Rec**: More M than F, no male-to-male transmission.
- **Mitochondrial**: Mother passes to ALL offspring.`
          },
          { 
            id: 'cg-6', 
            name: 'Chromosomal Mapping: Linkage, Recombination', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Linkage**
- Genes on same chromosome tend to be inherited together.
- Violates Independent Assortment.

### **2. Recombination Frequency (RF)**
- RF = (Number of Recombinants / Total Offspring) * 100.
- **Mapping Unit**: 1% RF = 1 map unit (cM).
- Max RF is 50% (indistinguishable from unlinked).
- **Double Crossovers**: Least frequent class in 3-point cross.`
          },
          { 
            id: 'cg-7', 
            name: 'Population Genetics: Hardy-Weinberg', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. The Equations**
- Allele Freq: **p + q = 1**
- Genotype Freq: **p² + 2pq + q² = 1**
  - p² = Homo dom
  - 2pq = Heterozygote (Carrier)
  - q² = Homo rec (Disease prevalence)

### **2. Assumptions (Large Random Mating Pop)**
- No Mutation.
- No Migration (Gene flow).
- No Natural Selection.
- Random Mating.
- Infinite Population Size (No Genetic Drift).`
          },
        ]
      },
      {
        id: 'app-bio',
        name: 'D. Applied Biotechnology [HY]',
        topics: [
          { 
            id: 'ab-1', 
            name: 'Recombinant DNA Tech: Vectors, Cloning', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Enzymes**
- **Restriction Endonucleases**: Type II (cut within palindromes). Sticky vs Blunt ends.
- **Ligase**: Joins PDE bonds.
- **Alk Phos**: Prevents vector self-ligation.

### **2. Vectors**
- **Features**: Ori, Selectable Marker (Abx resistance), MCS (Polylinker).
- **Types**:
  - *Plasmid*: <10kb.
  - *Phage/Cosmid*: 10-45kb.
  - *BAC/YAC*: >100kb (Genomic libraries).
  - *Expression Vector*: Has Promoter/RBS for protein production.`
          },
          { 
            id: 'ab-2', 
            name: 'PCR & Sequencing (Sanger, NGS)', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. PCR Cycles**
1. **Denaturation (94-98°C)**: Strands separate.
2. **Annealing (50-65°C)**: Primers bind. Temp depends on Tm.
3. **Extension (72°C)**: Taq Pol synthesizes DNA.

### **2. Sequencing**
- **Sanger (Chain Termination)**: Uses **ddNTPs** (dideoxy, no 3' OH). Stops synthesis at specific bases.
- **Next-Gen (NGS)**: High throughput.
  - *Illumina*: Reversible terminators, bridge amplification.
  - *Pyrosequencing*: Detects PPi release (Luciferase).`
          },
          { 
            id: 'ab-3', 
            name: 'Immunology: Antibodies, MHC, ELISA', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Antibodies**
- **IgG**: Most abundant, crosses placenta.
- **IgM**: Pentamer, first produced (primary response).
- **IgA**: Dimer, secretions (mucosa).
- **IgE**: Allergies, parasites.

### **2. MHC Molecules**
- **MHC I**: All nucleated cells. Presents **Endogenous** Ag to CD8+ T-cells.
- **MHC II**: APCs only. Presents **Exogenous** Ag to CD4+ T-cells.

### **3. Hybridoma**
- Fusion of B-cell + Myeloma -> Monoclonal antibodies (HAT selection).`
          },
          { 
            id: 'ab-4', 
            name: 'Analytical Techniques: Chromato, Electrophoresis', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Chromatography**
- **Gel Filtration (SEC)**: Size. Large elute FIRST, Small get stuck in beads.
- **Ion Exchange**: Charge. Anion exch (binds -ve), Cation exch (binds +ve). Elute with Salt/pH.
- **Affinity**: Specific binding (His-tag/Ni-NTA, GST/Glutathione).

### **2. Electrophoresis**
- **SDS-PAGE**: Separates proteins by Mass only. SDS confers uniform negative charge.
- **Isoelectric Focusing**: Separates by pI.`
          },
          { 
            id: 'ab-5', 
            name: 'Bioprocess Engineering: Kinetics', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Growth Phases**
- Lag, Log (Exponential), Stationary, Death.
- Specific growth rate (mu) = (ln X2 - ln X1) / (t2 - t1).

### **2. Monod Equation**
- mu = (mu_max * S) / (Ks + S).
- Analogous to Michaelis-Menten.

### **3. Modes**
- **Batch**: Closed system.
- **Fed-Batch**: Nutrient added, nothing removed. High density.
- **Chemostat**: Continuous input/output. Steady state.`
          },
        ]
      }
    ]
  },
  {
    id: 'chem-sci',
    name: '2. Chemical Sciences',
    chapters: [
      {
        id: 'org-chem',
        name: 'A. Organic Chemistry [HY]',
        topics: [
          { 
            id: 'oc-1', 
            name: 'GOC: Inductive, Resonance, Acidity/Basicity', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Electronic Effects**
- **Inductive (I)**: Sigma bonds. Distance dependent. -I (EWG) increases acidity.
- **Resonance (R)**: Pi bonds/Lone pairs. Delocalization adds stability.
- **Hyperconjugation**: Stabilizes Carbocations (3° > 2° > 1°).

### **2. Acidity & Basicity**
- **Acidity**: Stability of Conjugate Base. EWG increases acidity. (Phenol > Alcohol).
- **Basicity**: Availability of Lone Pair. EDG increases basicity. (Amines: 2° > 1° > 3° in aq).`
          },
          { 
            id: 'oc-2', 
            name: 'Reaction Mechanisms: SN1, SN2, E1, E2', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Substitution**
- **SN1**: 2 steps. Carbocation intermediate. 3° > 2°. Weak nuc/Polar protic solvent. **Racemization**.
- **SN2**: 1 step. Transition state. 1° > 2°. Strong nuc/Polar Aprotic. **Walden Inversion**.

### **2. Elimination**
- **E1**: Carbocation. Zaitsev product (more sub alkene).
- **E2**: Single step. Anti-periplanar geometry required.`
          },
          { 
            id: 'oc-3', 
            name: 'Stereochemistry: R/S, Enantiomers', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Isomers**
- **Enantiomers**: Non-superimposable mirror images. Rotate light. Same physical props.
- **Diastereomers**: Non-mirror images. Different physical props.
- **Meso**: Chiral centers but plane of symmetry -> Optically inactive.

### **2. Naming**
- **R/S System**: Assign priority (Atomic #). 
  - 1->2->3 CW = R.
  - 1->2->3 CCW = S.
  - Flip if lowest group is on horizontal (Fisher) or wedge.`
          },
          { 
            id: 'oc-4', 
            name: 'Biomolecule Chemistry', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Carbohydrates**
- **Anomers**: Alpha vs Beta glucose (mutarotation at C1).
- **Linkages**: Starch (alpha 1,4), Cellulose (beta 1,4 - humans can't digest).
- **Reducing Sugars**: Have free aldehyde/ketone (Hemiacetal). Positive Tollen's/Fehling's.

### **2. Lipids**
- Saponification: Hydrolysis of ester bonds by base.`
          },
        ]
      },
      {
        id: 'phys-chem',
        name: 'B. Physical Chemistry',
        topics: [
          { 
            id: 'pc-1', 
            name: 'Chemical Kinetics: Rate laws, Half-life', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Order of Reaction**
- **Zero Order**: Rate = k. [A] vs t is linear. t1/2 depends on [A]0.
- **First Order**: Rate = k[A]. ln[A] vs t is linear. t1/2 = 0.693/k (Constant). Radioactivity is 1st order.
- **Second Order**: Rate = k[A]^2. 1/[A] vs t is linear.

### **2. Arrhenius Equation**
- k = A * e^(-Ea/RT).
- Log form: ln(k2/k1) = -Ea/R (1/T2 - 1/T1).`
          },
          { 
            id: 'pc-2', 
            name: 'Thermodynamics: Laws, Gibbs Free Energy', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Laws**
- 1st: Conservation of Energy (dU = q + w).
- 2nd: Entropy of universe increases (dS_univ > 0).

### **2. Gibbs Free Energy (G)**
- **dG = dH - TdS**.
- dG < 0: Spontaneous (Exergonic).
- dG = 0: Equilibrium.
- dG > 0: Non-spontaneous (Endergonic).
- Relation to K: dG° = -RT ln K.`
          },
          { 
            id: 'pc-3', 
            name: 'Solutions: Molarity, Colligative Properties', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Concentrations**
- Molarity (M): mol / L. (Temp dependent).
- Molality (m): mol / kg solvent. (Temp independent).

### **2. Colligative Properties (Depend on # particles i)**
- **Osmotic Pressure**: pi = iMRT.
- **Boiling Point Elevation**: dT = i * Kb * m.
- **Freezing Point Depression**: dT = i * Kf * m.
- **Raoult's Law**: Vapor pressure lowering.`
          },
          { 
            id: 'pc-4', 
            name: 'Equilibrium: pH, Buffers, Henderson-Hasselbalch', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Acids/Bases**
- pH = -log[H+].
- Kw = 10^-14. pH + pOH = 14.

### **2. Buffers**
- Resist pH change. Weak Acid + Conj Base.
- Max capacity at pH = pKa.

### **3. Henderson-Hasselbalch**
- **pH = pKa + log ([Salt]/[Acid])**.
- Crucial for amino acid charge calc and buffer prep.`
          },
        ]
      }
    ]
  },
  {
    id: 'phys-sci',
    name: '3. Physical Sciences',
    chapters: [
      {
        id: 'phys-core',
        name: 'Core Physics Concepts',
        topics: [
          { 
            id: 'ph-1', 
            name: 'Units, Dimensions, Error Analysis', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Dimensions**
- Force: [MLT^-2]. Energy: [ML^2T^-2].
- Homogeneity principle: Check formulas.

### **2. Errors**
- **Relative Error**: dX/X.
- **Powers**: If Z = A^n, then dZ/Z = n * (dA/A).
- Significant figures rules.`
          },
          { 
            id: 'ph-2', 
            name: 'Modern Physics: Atomic structure, Radioactivity', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Photoelectric Effect**
- Light as particle (Photon). E = hf.
- KE_max = hf - WorkFunction.

### **2. Radioactivity**
- **Alpha**: Helium nucleus.
- **Beta**: Electron/Positron.
- **Decay Law**: N = N0 * e^(-lambda * t).
- Half life T1/2 = 0.693 / lambda.
- **Activity**: dN/dt = -lambda * N.`
          },
          { 
            id: 'ph-3', 
            name: 'Optics: Ray/Wave, Microscopy', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Microscope Resolution (Abbe)**
- **d = 0.61 * lambda / NA**.
- To improve resolution (lower d): Decrease Wavelength (blue light/electrons) or Increase NA (Oil immersion).

### **2. Wave Optics**
- **Interference**: YDSE fringe width beta = (lambda * D) / d.
- **Diffraction**: Bending of light.`
          },
          { 
            id: 'ph-4', 
            name: 'Fluid Mechanics: Viscosity, Bernoulli', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Bernoulli's Principle**
- Conservation of Energy for fluids.
- P + 1/2 rho v^2 + rho g h = Constant.
- Fast moving fluid -> Low pressure.

### **2. Viscosity & Flow**
- **Poiseuille's Law**: Flow rate Q is proportional to r^4. Small change in radius -> huge change in flow.
- **Stokes Law**: Terminal velocity in viscous fluid.`
          },
        ]
      }
    ]
  },
  {
    id: 'math',
    name: '4. Mathematics (Survival Math)',
    chapters: [
      {
        id: 'math-core',
        name: 'Essential Math Concepts',
        topics: [
          { 
            id: 'ma-1', 
            name: 'Biostatistics: Mean, SD, Variance, CV', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Measures of Central Tendency**
- **Mean**: Average. Sensitive to outliers.
- **Median**: Middle value. Robust to outliers.
- **Mode**: Most frequent.

### **2. Dispersion**
- **Variance**: Average squared deviation.
- **Standard Deviation (SD)**: Square root of Variance.
- **CV (Coeff of Variation)**: (SD / Mean) * 100. Dimensionless, good for comparing datasets.`
          },
          { 
            id: 'ma-2', 
            name: 'Probability: Binomial, Poisson, Bayes', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Basics**
- **AND**: Multiply (Independent events).
- **OR**: Add (Mutually exclusive).

### **2. Distributions**
- **Binomial**: n trials, p success. Mean = np.
- **Poisson**: Rare events. Mean = Variance = lambda.

### **3. Bayes Theorem**
- P(A|B) = P(B|A) * P(A) / P(B).
- Updating probability based on new evidence.`
          },
          { 
            id: 'ma-3', 
            name: 'Logarithms, Exponentials, Basic Calculus', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Logs**
- log(ab) = log a + log b.
- log(a^n) = n log a.
- pH calculations depend heavily on this.

### **2. Calculus**
- **Derivative**: Rate of change (Slope). d/dx (x^n) = nx^(n-1). Maxima/Minima where slope = 0.
- **Integral**: Area under curve. Used in work done, total growth.`
          },
          { 
            id: 'ma-4', 
            name: 'Hypothesis Testing: t-test, ANOVA, Chi-square', 
            priority: 'high-yield', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. P-value**
- Probability of observing data if Null Hypothesis is true.
- p < 0.05: Reject Null (Significant).

### **2. Tests**
- **t-test**: Compare Means of 2 groups.
- **ANOVA**: Compare Means of >2 groups.
- **Chi-Square**: Compare Frequencies (Categorical data, Genetics crosses).`
          },
        ]
      }
    ]
  },
  {
    id: 'aptitude',
    name: '5. General Aptitude',
    chapters: [
      {
        id: 'apt-core',
        name: 'Logical Reasoning & Data',
        topics: [
          { 
            id: 'apt-1', 
            name: 'Logical Reasoning', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Syllogisms**
- Use Venn Diagrams.
- "All A are B" -> A is inside B.
- "Some A are B" -> Intersection.

### **2. Series**
- Look for patterns:
  - Difference (AP).
  - Ratio (GP).
  - Squares/Cubes.
  - Prime numbers.`
          },
          { 
            id: 'apt-2', 
            name: 'Data Interpretation', 
            priority: 'normal', 
            status: 'not-started', 
            recallStrength: 'none', 
            revisionCount: 0, 
            mistakeCount: 0,
            notes: `### **1. Tips**
- Read labels and axes first.
- **Approximation**: Round numbers for quick calc (e.g., 49% -> 50%).
- **Percentage Change**: (Final - Initial) / Initial * 100.`
          },
        ]
      }
    ]
  }
];

export const EXAM_DATE = '2026-08-31';
export const START_DATE = '2026-01-05';