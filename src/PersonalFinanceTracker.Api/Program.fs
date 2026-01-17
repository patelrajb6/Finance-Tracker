namespace PersonalFinanceTracker.Api

open System
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.Extensions.Hosting
open Microsoft.Extensions.DependencyInjection
open Microsoft.Extensions.Logging
open PersonalFinanceTracker.Domain
open PersonalFinanceTracker.Data.Repositories

module Program =

    [<EntryPoint>]
    let main args =
        let builder = WebApplication.CreateBuilder(args)

        // Add Services
        builder.Services.AddControllers()
            .AddJsonOptions(fun options -> 
                options.JsonSerializerOptions.PropertyNameCaseInsensitive <- true
            )
            |> ignore
        
        // Dependency Injection
        // Switched to In-Memory for frontend dev/demo        // Dependency Injection
        builder.Services.AddSingleton<ITransactionRepository>(fun _ -> 
            new InMemoryTransactionRepository() :> ITransactionRepository
        ) |> ignore
        
        builder.Services.AddSingleton<IBudgetRepository>(fun _ -> 
            new InMemoryBudgetRepository() :> IBudgetRepository
        ) |> ignore      // CORS
        builder.Services.AddCors(fun options ->
            options.AddPolicy("AllowAll",
                fun builder -> 
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader() |> ignore
            )
        ) |> ignore

        let app = builder.Build()

        app.UseCors("AllowAll") |> ignore
        app.UseHttpsRedirection() |> ignore
        app.MapControllers() |> ignore

        app.Run()
        0 // Exit code
