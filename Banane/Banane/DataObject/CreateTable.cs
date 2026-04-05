using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Banane.ObjetMetier;
using static System.Net.Mime.MediaTypeNames;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Microsoft.EntityFrameworkCore;

namespace Banane.DataObject
{
    public  class CreateTable : DbContext
    {
    
            public DbSet<ADMINISTRATEUR> ADMINISTRATEUR { get; set; } = null;
            public DbSet<CONVERSATION> CONVERSATION { get; set; } = null;
            public DbSet<DOCUMENT> DOCUMENT { get; set; } = null;
            public DbSet<ENSEIGNANT> ENSEIGNANT { get; set; } = null;
            public DbSet<ETUDIANT> ETUDIANT { get; set; } = null;
            public DbSet<FILIERE> FILIERE { get; set; } = null;
            public DbSet<MATIERE> MATIERE { get; set; } = null;
            public DbSet<MEMBRECONVERSATION> MEMBRECONVERSATION { get; set; } = null;
            public DbSet<MESSAGE> MESSAGE { get; set; } = null;
            public DbSet<NIVEAUSCOLAIRE> NIVEAUSCOLAIRE { get; set; } = null;
            public DbSet<UTILISATEUR> UTILISATEUR { get; set; } = null;
            public DbSet<ABSENCE> ABSENCE { get; set; } = null;

        //public CreateTable(DbContextOptions<CreateTable> options) : base(options)
        //{
        //}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            


            modelBuilder.Entity<MATIERE>(entity =>
            {
                // Clé primaire
                entity.HasKey(m => m.IdMatiere);

                // FK vers NIVEAUSCOLAIRE - CASCADE autorisé
                entity.HasOne(m => m.NiveauScolaire)
                    .WithMany(n => n.Matieres)  // si vous avez la collection, sinon .WithMany()
                    .HasForeignKey(m => m.IdNiveauScolaire_fk_Matiere)
                    .OnDelete(DeleteBehavior.Cascade);

                // FK vers ENSEIGNANT - NO ACTION (résout le problème)
                entity.HasOne(m => m.Enseignant)
                    .WithMany(e => e.Matiere_Enseigner)  // si vous avez la collection, sinon .WithMany()
                    .HasForeignKey(m => m.IdEnseignant_fk)
                    .OnDelete(DeleteBehavior.NoAction);  // ← PAS de cascade
            });
        }



        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            {
                optionsBuilder.UseSqlServer(
                    @"Data Source=localhost\MSSQLSERVER01;
                      Initial Catalog=BananeDB;
                      Integrated Security=True;
                      Connect Timeout=30;
                      TrustServerCertificate=True");

            }



        
    }
}
