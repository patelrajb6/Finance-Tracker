namespace PersonalFinanceTracker.Data

open System
open System.Threading.Tasks
open Npgsql
open Dapper
open System.Collections.Concurrent
open PersonalFinanceTracker.Domain

module Repositories =
    
    type ITransactionRepository =
        abstract member Create: Transaction -> Task<unit>
        abstract member GetAll: unit -> Task<Transaction seq>
        abstract member GetByCategory: string -> Task<Transaction seq>
        abstract member Delete: Guid -> Task<unit>

    type TransactionRepository(connectionString: string) =
        interface ITransactionRepository with
            member this.Create(txn: Transaction) =
                task {
                    use conn = new NpgsqlConnection(connectionString)
                    let sql = 
                        """
                        INSERT INTO transactions (id, account_id, amount, transaction_type, category, description, date, created_at)
                        VALUES (@Id, @AccountId, @Amount, @TransactionType, @Category, @Description, @Date, @CreatedAt)
                        """
                    // Casting complex types to string/int for Dapper might be needed depending on handler setup, 
                    // but for simplicity here assume Dapper handles simple mappings or we project
                    let param = 
                        {|
                            Id = txn.Id; AccountId = txn.AccountId; Amount = txn.Amount; 
                            TransactionType = txn.TransactionType.ToString(); 
                            Category = txn.Category.ToString(); 
                            Description = txn.Description; Date = txn.Date; CreatedAt = txn.CreatedAt
                        |}
                    
                    let! _ = conn.ExecuteAsync(sql, param)
                    return ()
                }

            member this.GetAll() =
                task {
                    use conn = new NpgsqlConnection(connectionString)
                    // Note: Reconstructing Discriminated Unions from DB requires some mapping logic.
                    // Simplified for this example to return raw DTOs or similar.
                    // Ideally we'd map back to Domain types.
                    return Seq.empty // Placeholder for full mapping implementation
                }

            member this.GetByCategory(category: string) =
                task {
                    return Seq.empty
                }

            member this.Delete(id: Guid) =
                task {
                    // Placeholder for SQL implementation
                    return ()
                }

    type IBudgetRepository =
        abstract member GetBudget: category:string -> month:int -> year:int -> Task<Budget option>
        abstract member SaveBudget: Budget -> Task<unit>
        abstract member GetAllBudgets: unit -> Task<Budget seq>

    type BudgetRepository(connectionString: string) =
        interface IBudgetRepository with
            member this.GetBudget category month year =
                task {
                    // Placeholder
                    return None
                }
            member this.SaveBudget budget = task { return () }
            member this.GetAllBudgets() = task { return Seq.empty }

    type InMemoryBudgetRepository() =
        let mutable budgets = List.empty<Budget>
        let lockObj = obj()

        interface IBudgetRepository with
            member this.GetBudget category month year =
                task {
                    return lock lockObj (fun () ->
                        budgets |> List.tryFind (fun b -> 
                            string b.Category = category && b.Month = month && b.Year = year
                        )
                    )
                }

            member this.SaveBudget budget =
                task {
                    lock lockObj (fun () ->
                        // Remove existing budget for same period/category if exists
                        budgets <- budgets |> List.filter (fun b -> 
                            not (b.Category = budget.Category && b.Month = budget.Month && b.Year = budget.Year)
                        )
                        budgets <- budget :: budgets
                    )
                    return ()
                }

            member this.GetAllBudgets() =
                task {
                    return lock lockObj (fun () -> budgets) :> seq<_>
                }

    type InMemoryTransactionRepository() =
        // Switched to a customized list or locking for delete support. 
        // For simplicity in this demo, using a synchronized List or locking around a mutable list.
        let mutable transactions = List.empty<Transaction>
        let lockObj = obj()
        
        interface ITransactionRepository with
            member this.Create(txn: Transaction) =
                task {
                    lock lockObj (fun () -> 
                        transactions <- txn :: transactions
                    )
                    return ()
                }

            member this.GetAll() =
                task {
                    // Return most recent first
                    return lock lockObj (fun () -> 
                        transactions |> List.sortByDescending (fun t -> t.Date)
                    ) :> seq<_>
                }

            member this.GetByCategory(category: string) =
                task {
                    return lock lockObj (fun () ->
                        transactions 
                        |> List.filter (fun t -> string t.Category = category)
                        |> List.sortByDescending (fun t -> t.Date)
                    ) :> seq<_>
                }

            member this.Delete(id: Guid) =
                task {
                    lock lockObj (fun () ->
                        transactions <- transactions |> List.filter (fun t -> t.Id <> id)
                    )
                    return ()
                }
