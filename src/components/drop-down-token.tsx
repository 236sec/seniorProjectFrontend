"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TokenItem } from "@/constants/types/api/getTokensTypes";
import { getBaseUrl } from "@/env";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Coins } from "lucide-react";
import Image from "next/image";
import * as React from "react";

interface DropDownTokenProps {
  onSelect?: (token: TokenItem | null) => void;
  placeholder?: string;
  className?: string;
}

export function DropDownToken({
  onSelect,
  placeholder = "Select token...",
  className,
}: DropDownTokenProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const [tokens, setTokens] = React.useState<TokenItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedToken, setSelectedToken] = React.useState<TokenItem | null>(
    null
  );
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  const observer = React.useRef<IntersectionObserver | null>(null);
  const lastTokenRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchTokens = async (searchQuery: string, pageNum: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "20",
        page: pageNum.toString(),
      });

      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const url = `${getBaseUrl()}/api/tokens?${params.toString()}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const newTokens = data.data || [];

        if (pageNum === 1) {
          setTokens(newTokens);
        } else {
          setTokens((prev) => [...prev, ...newTokens]);
        }

        setHasMore(data.pagination?.hasNextPage || false);
      } else {
        console.error(
          `Failed to fetch tokens with status: ${response.status} ${response.statusText} - URL: ${url}`
        );
        if (pageNum === 1) {
          setTokens([]);
        }
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
      if (pageNum === 1) {
        setTokens([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setTokens([]);
      fetchTokens(search, 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Pagination effect
  React.useEffect(() => {
    if (page > 1) {
      fetchTokens(search, page);
    }
  }, [page]);

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    setValue(newValue);

    const token = tokens.find((t) => t.id === newValue) || null;
    setSelectedToken(token);
    onSelect?.(token);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[250px] justify-between", className)}
        >
          {selectedToken ? (
            <div className="flex items-center gap-2 w-full">
              {selectedToken.image?.thumb ? (
                <Image
                  src={selectedToken.image.thumb}
                  alt={selectedToken.name}
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full shrink-0"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Coins className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
              <span className="truncate flex-1 text-left">
                {selectedToken.name}
              </span>
              <span className="text-muted-foreground uppercase text-xs shrink-0">
                ({selectedToken.symbol})
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search tokens..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandList className="max-h-[300px] overflow-y-auto">
            {loading && page === 1 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                <CommandEmpty>No token found.</CommandEmpty>
                <CommandGroup>
                  {tokens.map((token, index) => (
                    <CommandItem
                      key={token.id}
                      value={token.id}
                      onSelect={handleSelect}
                      ref={
                        index === tokens.length - 1 ? lastTokenRef : undefined
                      }
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === token.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        {token.image?.thumb ? (
                          <Image
                            src={token.image.thumb}
                            alt={token.name}
                            width={20}
                            height={20}
                            className="h-5 w-5 rounded-full shrink-0"
                          />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Coins className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex flex-col w-full">
                          <span className="truncate font-medium block">
                            {token.name}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase">
                            {token.symbol}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                  {loading && page > 1 && (
                    <div className="py-2 text-center text-xs text-muted-foreground">
                      Loading more...
                    </div>
                  )}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
