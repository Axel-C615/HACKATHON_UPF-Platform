namespace ApiBanane.ObjetMDTO
{
    public class TransfereEtudiantParNiveauDTO
    {
        
            public int AncienNiveauId { get; set; }
            public int NouveauNiveauId { get; set; }
            public List<int> EtudiantsIds { get; set; } = new();
        
    }
}
